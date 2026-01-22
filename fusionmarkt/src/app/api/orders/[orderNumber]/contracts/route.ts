/**
 * Order Contracts API
 * GET /api/orders/[orderNumber]/contracts - Get contract HTML for an order
 * 
 * Query params:
 * - type: "terms" | "distance" | "all"
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma, Prisma } from "@repo/db";
import { authOptions } from "@/lib/auth";
import { generateContractsHTML } from "@/lib/contracts";

interface ContractAcceptance {
  type: string;
  date: string;
  contracts: {
    termsAndConditions: boolean;
    distanceSalesContract: boolean;
    newsletter: boolean;
    acceptedAt: string;
    termsAndConditionsHTML?: string;
    distanceSalesContractHTML?: string;
  };
  note: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all";

    // Get session for authentication
    const session = await getServerSession(authOptions);

    // Find order
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      select: {
        id: true,
        orderNumber: true,
        userId: true,
        statusHistory: true,
        createdAt: true,
        subtotal: true,
        shippingCost: true,
        discount: true,
        total: true,
        billingAddress: true,
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        items: {
          select: {
            price: true,
            quantity: true,
            variantInfo: true,
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Sipariş bulunamadı" },
        { status: 404 }
      );
    }

    // Authorization: 
    // - Order number acts as a secret token (received via email)
    // - If user is logged in, verify they own the order
    // - Admins can view all
    // - Allow public access for email links (order number is the auth)
    const isOwner = session?.user?.id === order.userId;
    const userRole = session?.user?.role;
    const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";
    
    // If user is logged in but doesn't own the order and isn't admin, deny access
    // Unless we allow public contract viewing (for email links)
    if (session?.user && !isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Bu siparişe erişim yetkiniz yok" },
        { status: 403 }
      );
    }
    
    // If not logged in, allow access (order number in email is the auth token)
    // The order number is only known to the customer and sent via email

    // Find contract acceptance in status history
    const statusHistory = (order.statusHistory as unknown[]) || [];
    const contractEntry = statusHistory.find(
      (entry: unknown) => (entry as ContractAcceptance).type === "CONTRACT_ACCEPTANCE"
    ) as ContractAcceptance | undefined;

    if (!contractEntry) {
      return NextResponse.json(
        { error: "Sözleşme bilgisi bulunamadı" },
        { status: 404 }
      );
    }

    let contracts = contractEntry.contracts;

    const missingHTML =
      !contracts.termsAndConditionsHTML || !contracts.distanceSalesContractHTML;

    if (missingHTML && isAdmin) {
      const buyerName =
        order.billingAddress?.fullName ||
        `${order.billingAddress?.firstName || ""} ${order.billingAddress?.lastName || ""}`.trim() ||
        order.user?.name ||
        "Belirtilmedi";

      const buyerAddress = order.billingAddress
        ? `${order.billingAddress.address || order.billingAddress.addressLine1 || ""}, ${order.billingAddress.district || ""}, ${order.billingAddress.city || ""} ${order.billingAddress.postalCode || ""}`.replace(/,\s*,/g, ",").trim()
        : "Belirtilmedi";

      const buyerPhone = order.billingAddress?.phone || order.user?.phone || "Belirtilmedi";
      const buyerEmail = order.user?.email || "Belirtilmedi";

      const orderItems = order.items.map((item) => ({
        name: item.product?.name || "Ürün",
        variant: item.variantInfo ? { value: JSON.parse(item.variantInfo)?.value } : undefined,
        price: Number(item.price),
        quantity: item.quantity,
      }));

      const orderTotals = {
        subtotal: Number(order.subtotal),
        shipping: Number(order.shippingCost),
        discount: Number(order.discount),
        grandTotal: Number(order.total),
      };

      const contractDate = contractEntry.date ? new Date(contractEntry.date) : order.createdAt;
      const contractsHTML = generateContractsHTML(
        {
          fullName: buyerName,
          address: buyerAddress,
          phone: buyerPhone,
          email: buyerEmail,
        },
        orderItems,
        orderTotals,
        order.orderNumber,
        contractDate
      );

      const updatedContracts = {
        ...contracts,
        termsAndConditionsHTML: contractsHTML.termsAndConditions,
        distanceSalesContractHTML: contractsHTML.distanceSalesContract,
      };

      const updatedHistory = statusHistory.map((entry) => {
        const currentEntry = entry as ContractAcceptance;
        if (currentEntry.type === "CONTRACT_ACCEPTANCE") {
          return { ...currentEntry, contracts: updatedContracts };
        }
        return entry;
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { statusHistory: updatedHistory as unknown as Prisma.InputJsonValue },
      });

      contracts = updatedContracts;
    }

    // Return requested contract type
    if (type === "terms") {
      return NextResponse.json({
        type: "termsAndConditions",
        accepted: contracts.termsAndConditions,
        acceptedAt: contracts.acceptedAt,
        html: contracts.termsAndConditionsHTML || null,
      });
    }

    if (type === "distance") {
      return NextResponse.json({
        type: "distanceSalesContract",
        accepted: contracts.distanceSalesContract,
        acceptedAt: contracts.acceptedAt,
        html: contracts.distanceSalesContractHTML || null,
      });
    }

    // Return all contracts
    return NextResponse.json({
      orderNumber: order.orderNumber,
      acceptedAt: contracts.acceptedAt,
      contracts: {
        termsAndConditions: {
          accepted: contracts.termsAndConditions,
          html: contracts.termsAndConditionsHTML || null,
        },
        distanceSalesContract: {
          accepted: contracts.distanceSalesContract,
          html: contracts.distanceSalesContractHTML || null,
        },
        newsletter: contracts.newsletter,
      },
    });
  } catch (error) {
    console.error("Error fetching contracts:", error);
    return NextResponse.json(
      { error: "Sözleşmeler alınamadı" },
      { status: 500 }
    );
  }
}

