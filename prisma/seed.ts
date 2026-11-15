import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const categoria = (name: string) =>
    prisma.category.upsert({ where: { name }, update: {}, create: { name } });

  const teclados = await categoria("Teclados");
  const mouses = await categoria("Mouses");
  const placasDeVideo = await categoria("Placas de Vídeo");
  const monitores = await categoria("Monitores");
  const headsets = await categoria("Headsets");

  await prisma.product.createMany({
    data: [
      {
        sku: "TEC-001",
        name: "Teclado Mecânico AdapTech K1",
        description: "Switch Blue, ABNT2, RGB",
        price: 249.9,
        stockQuantity: 50,
        isHighDemand: false,
        categoryId: teclados.id,
        specs: { switch: "Blue", layout: "ABNT2", conexao: "USB-C" },
      },
      {
        sku: "MOU-001",
        name: "Mouse Gamer AdapTech M3",
        description: "6400 DPI, sensor óptico",
        price: 129.9,
        stockQuantity: 80,
        isHighDemand: false,
        categoryId: mouses.id,
        specs: { dpi: 6400, botoes: 6, conexao: "USB" },
      },
      {
        sku: "GPU-RTX4070",
        name: "Placa de Vídeo RTX 4070",
        description: "12GB GDDR6X - alta demanda",
        price: 3799.0,
        stockQuantity: 10,
        isHighDemand: true, // regra de limite de 2un/30dias se aplica
        categoryId: placasDeVideo.id,
        specs: { memoria: "12GB GDDR6X", consumo: "200W" },
      },
      {
        sku: "MON-24FHD",
        name: "Monitor 24 polegadas Full HD 144Hz",
        description: "Painel IPS, 1ms, HDMI e DisplayPort",
        price: 899.9,
        stockQuantity: 15,
        isHighDemand: false,
        categoryId: monitores.id,
        specs: { tela: "24\"", resolucao: "1920x1080", taxa: "144Hz" },
      },
      {
        sku: "MON-27UHD",
        name: "Monitor 27 polegadas 4K",
        description: "Painel IPS 4K com HDR",
        price: 2199.0,
        stockQuantity: 6,
        isHighDemand: false,
        categoryId: monitores.id,
        specs: { tela: "27\"", resolucao: "3840x2160", taxa: "60Hz" },
      },
      {
        sku: "HEA-001",
        name: "Headset Gamer AdapTech H2",
        description: "Som surround 7.1, microfone removível",
        price: 189.9,
        stockQuantity: 40,
        isHighDemand: false,
        categoryId: headsets.id,
        specs: { conexao: "USB", microfone: "removível" },
      },
    ],
    skipDuplicates: true,
  });

  // Cupons de exemplo (os testes em scripts/ dependem destes códigos)
  const inicio = new Date("2020-01-01T00:00:00.000Z");
  const fim = new Date("2030-12-31T23:59:59.000Z");

  await prisma.coupon.createMany({
    data: [
      { code: "BEMVINDO10", discountType: "PERCENTUAL", discountValue: 10, validFrom: inicio, validUntil: fim, maxUses: 1000 },
      { code: "DESCONTO50", discountType: "FIXO", discountValue: 50, validFrom: inicio, validUntil: fim, maxUses: 1000 },
      { code: "EXPIRADO", discountType: "PERCENTUAL", discountValue: 10, validFrom: new Date("2023-01-01T00:00:00.000Z"), validUntil: new Date("2024-01-01T00:00:00.000Z"), maxUses: 100 },
      { code: "ESGOTADO", discountType: "PERCENTUAL", discountValue: 10, validFrom: inicio, validUntil: fim, maxUses: 0 },
      { code: "INATIVO", discountType: "PERCENTUAL", discountValue: 10, validFrom: inicio, validUntil: fim, maxUses: 100, isActive: false },
    ],
    skipDuplicates: true,
  });

  console.log("Seed concluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });