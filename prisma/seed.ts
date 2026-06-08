import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 拠点マスター
  const trobar = await prisma.location.upsert({
    where: { id: "loc-trobar" },
    update: {},
    create: { id: "loc-trobar", name: "八ヶ岳トロバール" },
  });
  const gouton = await prisma.location.upsert({
    where: { id: "loc-gouton" },
    update: {},
    create: { id: "loc-gouton", name: "グートンデリ" },
  });

  // メンバーマスター（サンプル）
  const adminMember = await prisma.member.upsert({
    where: { id: "member-admin" },
    update: {},
    create: { id: "member-admin", name: "管理者", role: "admin" },
  });
  await prisma.member.upsert({
    where: { id: "member-trobar1" },
    update: {},
    create: { id: "member-trobar1", name: "トロバール担当", role: "trobar", locationId: trobar.id },
  });
  await prisma.member.upsert({
    where: { id: "member-gouton1" },
    update: {},
    create: { id: "member-gouton1", name: "グートン担当", role: "gouton", locationId: gouton.id },
  });

  // 管理者ログインアカウント（初期パスワードは導入後すぐ変更してください）
  const passwordHash = await bcrypt.hash("changeme123", 10);
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: { email: "admin@example.com", passwordHash, memberId: adminMember.id },
  });

  // 商品マスター（例）
  for (const name of ["24ヶ月生ハム", "鹿サラミ", "リエット"]) {
    await prisma.product.upsert({
      where: { id: `product-${name}` },
      update: {},
      create: { id: `product-${name}`, name, category: "シャルキュトリー" },
    });
  }

  // 原料マスター（例）
  for (const name of ["豚モモ", "塩", "黒胡椒"]) {
    await prisma.material.upsert({
      where: { id: `material-${name}` },
      update: {},
      create: { id: `material-${name}`, name },
    });
  }

  console.log("シードデータを投入しました。初期管理者: admin@example.com / changeme123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
