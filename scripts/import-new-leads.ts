import { PrismaClient } from "@/lib/generated/prisma"

const prisma = new PrismaClient()

const sampleLeads = [
  { full_name: "Mehmet Balık", phone: "5462636292", products: ["borsa"] },
  { full_name: "Burak Balci", phone: "5467423189", products: ["borsa"] },
  { full_name: "Ali Çelik", phone: "5053508273", products: ["borsa", "cripto"] },
  { full_name: "Ismail Ors", phone: "5367009097", products: ["borsa"] },
  { full_name: "Dilek Doğan", phone: "5536375134", products: ["borsa"] },
  { full_name: "Hilmi Çörüş", phone: "5368547122", products: ["borsa"] },
  { full_name: "Hasan Karadağ", phone: "5438333143", products: ["borsa"] },
  { full_name: "Muhammed Kandil", phone: "5428079978", products: ["borsa"] },
  { full_name: "Coşkun Karga", phone: "5346937564", products: ["borsa"] },
  { full_name: "Yakup Yitmen", phone: "5453839121", products: ["borsa"] },
  { full_name: "Ali Duymaz", phone: "5539804040", products: ["borsa"] },
  { full_name: "Bekir Solar", phone: "5325053100", products: ["borsa"] },
  { full_name: "Erdoğan Gökmen", phone: "5356677069", products: ["borsa"] },
  { full_name: "Mehmet Şirin Doğan", phone: "5468248599", products: ["borsa"] },
  { full_name: "Selçuk Çoban", phone: "5349274628", products: ["borsa"] },
  { full_name: "Fatih Uzuner", phone: "5059271802", products: ["borsa"] },
  { full_name: "Samet Can", phone: "5456494083", products: ["borsa"] },
  { full_name: "Nermin Kaplan", phone: "5363440921", products: ["borsa", "forex", "cripto"] },
  { full_name: "Cenab Ceylan", phone: "5356757470", products: ["borsa"] },
  { full_name: "İlyas Yaprak", phone: "5511454067", products: ["borsa", "cripto"] },
  { full_name: "Yücel", phone: "5320610680", products: ["borsa"] },
  { full_name: "Salih Mesçioğlu", phone: "5325423371", products: ["borsa", "forex"] },
  { full_name: "Oğuzhan Akkuzu", phone: "5458851899", products: ["borsa"] },
  { full_name: "Oğuzhan Erdoğdu", phone: "5455087362", products: ["borsa", "cripto"] },
  { full_name: "Elvan Kurt", phone: "5365250355", products: ["borsa"] },
  { full_name: "Alptekin Saravan", phone: "5376532774", products: ["borsa"] },
  { full_name: "Atilla Orhan", phone: "5336324726", products: ["borsa", "cripto"] },
]

async function importLeads() {
  console.log("Starting lead import...")

  // Get the product field
  const productField = await prisma.lead_fields.findFirst({
    where: { name: "interested_products" },
  })

  if (!productField) {
    console.error("Product field not found!")
    return
  }

  let imported = 0
  let skipped = 0

  for (const leadData of sampleLeads) {
    try {
      // Check if lead already exists
      const existing = await prisma.leads.findFirst({
        where: { phone: leadData.phone },
      })

      if (existing) {
        console.log(`⊘ Skipped: ${leadData.full_name} (already exists)`)
        skipped++
        continue
      }

      // Generate email from name and phone
      const emailName = leadData.full_name.toLowerCase().replace(/\s+/g, '').replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
      const email = `${emailName}${leadData.phone.slice(-4)}@example.com`

      // Create lead
      const lead = await prisma.leads.create({
        data: {
          full_name: leadData.full_name,
          email: email,
          phone: leadData.phone,
          phone_country: "+90",
          source: "website",
          status: "new",
          priority: "medium",
          created_at: new Date(),
          updated_at: new Date(),
        },
      })

      // Add custom field value (JSON array for multiselect)
      await prisma.lead_field_values.create({
        data: {
          lead_id: lead.id,
          lead_field_id: productField.id,
          value: JSON.stringify(leadData.products),
          created_at: new Date(),
          updated_at: new Date(),
        },
      })

      console.log(`✓ Imported: ${leadData.full_name} - ${leadData.products.join(', ')}`)
      imported++
    } catch (error: any) {
      console.error(`✗ Failed to import ${leadData.full_name}:`, error.message)
      skipped++
    }
  }

  console.log(`\n✓ Import completed!`)
  console.log(`  - Imported: ${imported}`)
  console.log(`  - Skipped: ${skipped}`)
}

importLeads()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
