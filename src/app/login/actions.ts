"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSessionToken, hashPassword } from "@/lib/auth";
import { clearSessionCookie, setSessionCookie } from "@/lib/session";

export async function registerAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const displayName = String(formData.get("displayName") ?? name).trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !password) {
    redirect("/login?error=missing-fields");
  }

  const user = await db.user.upsert({
    where: { name },
    create: {
      name,
      displayName: displayName || name,
      passwordHash: hashPassword(password)
    },
    update: {
      displayName: displayName || name,
      passwordHash: hashPassword(password)
    }
  });

  const token = createSessionToken();

  await db.session.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    }
  });

  await setSessionCookie(token);
  redirect("/");
}

export async function loginAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !password) {
    redirect("/login?error=missing-fields");
  }

  const user = await db.user.findUnique({ where: { name } });

  if (!user || user.passwordHash !== hashPassword(password)) {
    redirect("/login?error=invalid-credentials");
  }

  const token = createSessionToken();

  await db.session.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    }
  });

  await setSessionCookie(token);
  redirect("/");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}