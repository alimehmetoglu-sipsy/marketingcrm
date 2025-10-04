##GENERAL
CLAUDE.md dosyasına göre sana vereceğim analizi önce planla . planlama yaparken kendin bu kodları yazacaksın ona göre planlama yap . Detayları atlama iki defa düşün taskları oluştururken , CLAUDE.md den destek al . Playwright mcp ile hem planlama hem de test yapabilirsin. 


##BUG


##📝 Modül Dokümantasyon Oluşturma Prompt Şablonu
[MODÜL_ADI] modülü için aşağıdaki yapıda kapsamlı dokümantasyon oluştur:

## Dokümantasyon Yapısı

/home/ali/marketingcrm/docs/[modul_adi]/ klasörü altında şu dosyaları oluştur:

### 1. README.md
- Modül özeti ve genel bakış
- Ana özellikler listesi (✅ ile işaretli)
- Tüm alt dökümanların listesi ve kısa açıklamaları
- Quick Start örneği
- System Architecture diyagramı
- İlgili dosyaların linkleri (backend, frontend, settings)
- Version ve Last Updated bilgisi

### 2. DATABASE.md
- SQL schema (CREATE TABLE statements)
- Foreign key constraints tablosu
- Prisma schema modelleri
- Key fields açıklamaları (tablo formatında)
- Database queries örnekleri (findMany, create, update, delete, groupBy)
- BigInt serialization notları
- Cascade behavior açıklamaları

### 3. API.md
- Her endpoint için:
  - Method ve URL
  - Request headers
  - Request body (TypeScript interface)
  - Response format (success ve error)
  - Backend logic (kod örneği)
  - Usage examples
- Error handling bölümü
- Validation (Zod schema örnekleri)
- Best practices

### 4. COMPONENTS.md
- Tüm component'lerin detaylı dokümantasyonu
- Props interface'leri
- Component hierarchy
- Usage examples (kod örnekleri ile)
- Helper functions
- State management
- Complete implementation examples

### 5. [ÖZELLIK_ADI].md (Modüle özgü özellik)
- Özellik tanımı ve kullanım alanları
- Management UI
- CRUD operations
- Form validation
- Best practices
- Visual examples

### 6. IMPLEMENTATION.md
- Usage examples (step by step)
- Data flow diyagramları (ASCII art)
- Best practices (✅ Good / ❌ Bad örnekleri ile)
- Implementation details
- Advanced examples (bulk operations, statistics, etc.)

### 7. VISUAL-GUIDE.md
- UI/UX design patterns
- Layout structure (ASCII art ile)
- Complete TSX implementation
- Color scheme (tablo formatında)
- Spacing system
- Empty states
- Responsive design (mobile, tablet, desktop)
- Animation and transitions
- Best practices

### 8. NOTES.md
- Important Details (numbered list)
- Known Issues (crossed if fixed: ~~Issue~~ ✅ FIXED)
- Future Improvements (High/Medium/Low priority)
- Migration Notes
- Support & Troubleshooting
- Version History (tablo formatında)

## Önemli Kurallar

1. **Gerçek Kod Kullan**: 
   - Projedeki GERÇEK implementasyonu kontrol et
   - Database schema'yı Prisma'dan al
   - API route'ları gerçek dosyalardan kopyala
   - Component'leri gerçek koddan al

2. **Format**:
   - Markdown formatında
   - Kod blokları syntax highlighted (```typescript, ```sql, ```tsx)
   - Tablolar kullan (alignment önemli)
   - ASCII art diyagramlar
   - Emoji kullan (✅, ❌, 📋, 🎯, etc.)

3. **Örnekler**:
   - Her örnek çalışır kod olmalı
   - ✅ Good / ❌ Bad comparison'lar
   - Complete implementation examples
   - Real use cases

4. **Linkler**:
   - Dosya linkleri: [filename.ts](path/to/file.ts)
   - Satır linkleri: [filename.ts:42](path/to/file.ts#L42)
   - Diğer dokümanlara linkler: [← Back to README](./README.md)

5. **Consistency**:
   - Aynı terminolojiyi kullan
   - Aynı kod stilini kullan
   - Aynı örnek formatını kullan

## Başlamadan Önce

1. [MODÜL_ADI] için Prisma schema'yı oku
2. İlgili API route'ları oku
3. Component dosyalarını oku
4. Gerçek implementasyonu anla
5. Sonra dokümantasyonu yaz

## Modül Bilgileri

**Modül Adı**: [MODÜL_ADI]
**Ana Tablolar**: [TABLO_LISTESI]
**Ana Component'ler**: [COMPONENT_LISTESI]
**API Endpoints**: [ENDPOINT_LISTESI]

Şimdi dokümantasyonu oluşturmaya başla!
🎯 Kullanım Örneği - Tasks Modülü için
Tasks modülü için aşağıdaki yapıda kapsamlı dokümantasyon oluştur:

## Dokümantasyon Yapısı

/home/ali/marketingcrm/docs/tasks/ klasörü altında şu dosyaları oluştur:

[... yukarıdaki şablon aynen ...]

## Modül Bilgileri

**Modül Adı**: Tasks
**Ana Tablolar**: tasks, task_types, task_assignments
**Ana Component'ler**: TaskForm, TaskList, TaskDetail, AddTaskDialog
**API Endpoints**: 
- GET /api/tasks
- POST /api/tasks
- GET /api/tasks/[id]
- PUT /api/tasks/[id]
- DELETE /api/tasks/[id]

Şimdi dokümantasyonu oluşturmaya başla!
📋 Diğer Modüller İçin Hızlı Şablonlar
Leads Modülü
Leads modülü için dokümantasyon oluştur.
Modül: Leads
Tablolar: leads, lead_fields, lead_field_options, lead_field_values, lead_form_sections
Components: LeadForm, LeadsList, LeadDetail, AddLeadButton
Endpoints: /api/leads, /api/settings/lead-fields
Investors Modülü
Investors modülü için dokümantasyon oluştur.
Modül: Investors
Tablolar: investors, investor_fields, investor_field_options, investor_field_values, investor_form_sections
Components: InvestorForm, InvestorsList, InvestorDetail, AddInvestorButton
Endpoints: /api/investors, /api/settings/investor-fields
Representatives Modülü
Representatives modülü için dokümantasyon oluştur.
Modül: Representatives
Tablolar: representatives
Components: RepresentativeForm, RepresentativesList, RepresentativeDetail
Endpoints: /api/representatives