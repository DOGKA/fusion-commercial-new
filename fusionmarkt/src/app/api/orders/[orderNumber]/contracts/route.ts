/**
 * Order Contracts API
 * GET /api/orders/[orderNumber]/contracts - Get contract HTML for an order
 * 
 * Query params:
 * - type: "terms" | "distance" | "all"
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@repo/db";
import { authOptions } from "@/lib/auth";

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
    const isAdmin = session?.user?.role === "ADMIN";
    
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
    const statusHistory = order.statusHistory as unknown[];
    const contractEntry = statusHistory?.find(
      (entry: unknown) => (entry as ContractAcceptance).type === "CONTRACT_ACCEPTANCE"
    ) as ContractAcceptance | undefined;

    if (!contractEntry) {
      return NextResponse.json(
        { error: "Sözleşme bilgisi bulunamadı" },
        { status: 404 }
      );
    }

    const contracts = contractEntry.contracts;

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

