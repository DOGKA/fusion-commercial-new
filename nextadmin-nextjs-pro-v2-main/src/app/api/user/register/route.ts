import bcrypt from "bcrypt";
import { prisma } from "@/libs/prismaDb";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { name, email, password } = body;

		console.log("Register attempt:", { name, email });

		if (!name || !email || !password) {
			return NextResponse.json({ error: "Missing Fields" }, { status: 400 });
		}

		const formatedEmail = email.toLowerCase();

		const exist = await prisma.user.findUnique({
			where: {
				email: formatedEmail,
			},
		});

		if (exist) {
			return NextResponse.json({ error: "Email already exists" }, { status: 400 });
		}

		const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];

		function isAdminEmail(email: string) {
			return adminEmails.includes(email);
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const user = await prisma.user.create({
			data: {
				name,
				email: formatedEmail,
				password: hashedPassword,
				role: isAdminEmail(formatedEmail) ? "ADMIN" : "CUSTOMER",
			},
		});

		console.log("User created:", user.id);

		return NextResponse.json({ success: true, user: { id: user.id, email: user.email } });
	} catch (error: any) {
		console.error("Register error:", error);
		return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
	}
}
