import { PrismaClient } from "@/lib/generated/prisma"

const prisma = new PrismaClient()

const sampleLeads = [
  { full_name: "Haydar Çelikay", phone: "5443656642", email: "haydarcelikay970@gmail.com", product: "tavan_hisse" },
  { full_name: "Ali Akdag", phone: "5057218943", email: "y.eymen30@gmail.com", product: "tavan_hisse" },
  { full_name: "Sedat Polat", phone: "5413772568", email: "sedateminebuse021@gmail.com", product: "ucretsiz_sinyal" },
  { full_name: "Ekrem Oguz", phone: "5330316936", email: "ikramoguz272@gmail.com", product: "tavan_hisse" },
  { full_name: "Çakır Ucan", phone: "5461901986", email: "Ucanergin941@gmail.com", product: "tavan_hisse" },
  { full_name: "Yakup Arıkan", phone: "5524059476", email: "yakup978@gmail.com", product: "tavan_hisse" },
  { full_name: "Başak Kan", phone: "5448521825", email: "akdaglisenay@gmail.com", product: "tavan_hisse" },
  { full_name: "Huzur Başlangıcı", phone: "5063677178", email: "semra-topuz006@hotmail.com", product: "tavan_hisse" },
  { full_name: "Mustafa Öz", phone: "5368544942", email: "avkuru_74@hotmail.com", product: "tavan_hisse" },
  { full_name: "Engin Erden", phone: "5373783759", email: "erdem_engin20@mail.com", product: "tavan_hisse" },
  { full_name: "Sherrif", phone: "5392261662", email: "05510783659@gmail.com", product: "tavan_hisse" },
  { full_name: "Sevim Yaman", phone: "5360700674", email: "yamanh206@gmail.com", product: "tavan_hisse" },
  { full_name: "Hamit Yildiz", phone: "5449089090", email: "drhyildiz@hotmail.com", product: "ucretsiz_sinyal" },
  { full_name: "Ahmet Yüzgeç", phone: "5512725363", email: "ahmetyuzgec@hotmail.com", product: "ucretsiz_sinyal" },
  { full_name: "Kapadokya Sevdalısı", phone: "5459337272", email: "batman5072@hotmail.com", product: "ucretsiz_sinyal" },
  { full_name: "Ziya Çekiç", phone: "5060383168", email: "ziyackc@gmail.com", product: "tavan_hisse" },
  { full_name: "Halil Yüksek", phone: "5305162722", email: "yuksekhalil@hotmail.com", product: "tavan_hisse" },
  { full_name: "Onder Ikisivri", phone: "5519378896", email: "ikisivrionder29@gmail.com", product: "tavan_hisse" },
  { full_name: "Erkan Demi", phone: "5431723740", email: "erkandemi1728@gmail.com", product: "tavan_hisse" },
  { full_name: "Bora Beydil", phone: "5424239649", email: "www.moonstarfx@gmail.com", product: "ucretsiz_sinyal" },
  { full_name: "Abdullah Anar", phone: "5444375474", email: "apo.anar99@gmail.com", product: "ucretsiz_sinyal" },
  { full_name: "Ahmet Akan", phone: "5308851969", email: "ahmet_akan32@hotmail.com", product: "ucretsiz_sinyal" },
  { full_name: "Elqouf", phone: "5442322850", email: "maloumsaifaddin5@gmail.com", product: "ucretsiz_sinyal" },
  { full_name: "Sadi Arıkca", phone: "5360333650", email: "sadi19231865@gmail.com", product: "ucretsiz_sinyal" },
  { full_name: "Muammer Yildiz", phone: "5536646688", email: "m66yildiz@hotmail.com", product: "ucretsiz_sinyal" },
  { full_name: "Tarık Ulutaş", phone: "5051424005", email: "tarik071982@hotmail.com", product: "ucretsiz_sinyal" },
  { full_name: "Oguzhan Ak", phone: "5417921804", email: "oguzhan_zekiye@hotmail.com", product: "tavan_hisse" },
  { full_name: "Ünal Aydın", phone: "5327485031", email: "unalaydin_@hotmail.com", product: "tavan_hisse" },
  { full_name: "Fethullah Hader", phone: "5326219849", email: "Haderde@gmail.com", product: "tavan_hisse" },
]

async function importLeads() {
  console.log("Starting lead import...")

  // Get the product field
  const productField = await prisma.lead_fields.findFirst({
    where: { name: "interested_product" },
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
        where: {
          OR: [
            { email: leadData.email },
            { phone: leadData.phone },
          ],
        },
      })

      if (existing) {
        console.log(`⊘ Skipped: ${leadData.full_name} (already exists)`)
        skipped++
        continue
      }

      // Create lead
      const lead = await prisma.leads.create({
        data: {
          full_name: leadData.full_name,
          email: leadData.email,
          phone: leadData.phone,
          source: "website",
          status: "new",
          priority: "medium",
          created_at: new Date(),
          updated_at: new Date(),
        },
      })

      // Add custom field value
      await prisma.lead_field_values.create({
        data: {
          lead_id: lead.id,
          lead_field_id: productField.id,
          value: leadData.product,
          created_at: new Date(),
          updated_at: new Date(),
        },
      })

      console.log(`✓ Imported: ${leadData.full_name}`)
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
