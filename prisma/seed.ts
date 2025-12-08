import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const pass = await bcrypt.hash('password123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ahgzly.local' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@ahgzly.local',
      password: pass,
      role: 'ADMIN'
    }
  })

  const owner = await prisma.user.upsert({
    where: { email: 'owner@ahgzly.local' },
    update: {},
    create: {
      name: 'Owner',
      email: 'owner@ahgzly.local',
      password: pass,
      role: 'OWNER'
    }
  })

  await prisma.field.createMany({
    data: [
      {
        id: 'field-1',
        name: 'ملعب الزمالك',
        slug: 'zamalek-field',
        description: 'ملعب عالي الجودة',
        ownerId: owner.id,
        pricePerHour: 50.0,
        type: 'SOCCER'
      },
      {
        id: 'field-2',
        name: 'ملعب الأهلي',
        slug: 'ahly-field',
        description: 'ملعب ممتاز',
        ownerId: owner.id,
        pricePerHour: 40.0,
        type: 'SOCCER'
      }
    ]
  })

  console.log('Seed complete')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Starting seed...')

  // 1. Clear existing data
  console.log('🧹 Clearing existing data...')
  await prisma.payment.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.fieldSchedule.deleteMany()
  await prisma.timeSlot.deleteMany()
  await prisma.field.deleteMany()
  await prisma.area.deleteMany()
  await prisma.employee.deleteMany()
  await prisma.user.deleteMany()

  // 2. Create Areas
  console.log('📍 Creating areas...')
  const areas = await prisma.area.createManyAndReturn({
    data: [
      { name: 'المقطم' },
      { name: 'الهضبة الوسطي' },
      { name: 'مدينة نصر' },
      { name: 'الشروق' },
      { name: 'العبور' }
    ]
  })

  // 3. Create Users
  console.log('👥 Creating users...')
  
  const adminPassword = await hashPassword('admin123')
  const admin = await prisma.user.create({
    data: {
      name: 'مدير النظام',
      email: 'admin@ahgzly.com',
      password: adminPassword,
      role: 'ADMIN'
    }
  })

  const ownerPassword = await hashPassword('owner123')
  const owner = await prisma.user.create({
    data: {
      name: 'أحمد محمود',
      email: 'owner@ahgzly.com',
      password: ownerPassword,
      role: 'OWNER'
    }
  })

  const employeePassword = await hashPassword('employee123')
  const employeeUser = await prisma.user.create({
    data: {
      name: 'محمد علي',
      email: 'employee@ahgzly.com',
      password: employeePassword,
      role: 'EMPLOYEE'
    }
  })

  const userPassword = await hashPassword('user123')
  const user = await prisma.user.create({
    data: {
      name: 'محمود سعيد',
      email: 'user@ahgzly.com',
      password: userPassword,
      role: 'USER'
    }
  })

  // 4. Create Employee record
  console.log('👨‍💼 Creating employee...')
  const employee = await prisma.employee.create({
    data: {
      ownerId: owner.id,
      userId: employeeUser.id,
      fieldIds: []
    }
  })

  // Update user with employee reference
  await prisma.user.update({
    where: { id: employeeUser.id },
    data: { employeeRefId: employee.id }
  })

  // 5. Create Time Slots (06:00 to 23:00, hourly)
  console.log('⏰ Creating time slots...')
  const timeSlots = []
  
  for (let hour = 6; hour <= 23; hour++) {
    const start = `${hour.toString().padStart(2, '0')}:00`
    const end = `${(hour + 1).toString().padStart(2, '0')}:00`
    const label = `${start} - ${end}`
    
    const slot = await prisma.timeSlot.create({
      data: {
        start,
        end,
        label
      }
    })
    timeSlots.push(slot)
  }

  // 6. Create Fields
  console.log('⚽ Creating fields...')
  
  const fieldTypes = ['SOCCER', 'PADEL'] as const
  const fieldNames = [
    'ملعب النجوم', 'ملعب النصر', 'ملعب الأبطال', 'ملعب المستقبل',
    'ملعب التحدي', 'ملعب الأحلام', 'ملعب النخبة', 'ملعب التميز'
  ]
  
  const fields = []
  
  for (let i = 0; i < 8; i++) {
    const area = areas[i % areas.length]
    const fieldType = fieldTypes[i % 2]
    const isSoccer = fieldType === 'SOCCER'
    
    const field = await prisma.field.create({
      data: {
        ownerId: owner.id,
        name: fieldNames[i],
        type: fieldType,
        pricePerHour: isSoccer ? 200 : 150,
        location: `شارع ${i + 1}، ${area.name}`,
        areaId: area.id,
        image: `https://picsum.photos/seed/field${i}/600/400`,
        phone: '01012345678',
        description: `أفضل ملعب ${isSoccer ? 'كرة قدم' : 'بادل'} في ${area.name}. مجهز بأحدث التقنيات وإضاءة ليلية.`,
        openHour: '06:00',
        closeHour: '23:00',
        activeDays: [0, 1, 2, 3, 4, 5, 6] // All days
      }
    })
    fields.push(field)
    
    // Update employee fieldIds
    if (i < 4) {
      await prisma.employee.update({
        where: { id: employee.id },
        data: {
          fieldIds: {
            push: field.id
          }
        }
      })
    }
  }

  // 7. Create Field Schedules
  console.log('📅 Creating field schedules...')
  
  for (const field of fields) {
    // Create schedule for each active day
    for (const weekday of field.activeDays) {
      for (const slot of timeSlots) {
        // Skip some slots for variety
        if (Math.random() > 0.7) continue
        
        await prisma.fieldSchedule.create({
          data: {
            fieldId: field.id,
            slotId: slot.id,
            weekday
          }
        })
      }
    }
  }

  // 8. Create Sample Bookings
  console.log('📋 Creating sample bookings...')
  
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  // Past booking (confirmed)
  await prisma.booking.create({
    data: {
      fieldId: fields[0].id,
      userId: user.id,
      date: new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() - 1)),
      slotId: timeSlots[5].id, // 11:00-12:00
      slotLabel: timeSlots[5].label,
      amount: fields[0].pricePerHour,
      status: 'CONFIRMED'
    }
  })

  // Today booking (confirmed, within 24h, no deposit)
  await prisma.booking.create({
    data: {
      fieldId: fields[1].id,
      userId: user.id,
      date: new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())),
      slotId: timeSlots[10].id, // 16:00-17:00
      slotLabel: timeSlots[10].label,
      amount: fields[1].pricePerHour,
      status: 'CONFIRMED'
    }
  })

  // Future booking (pending, needs payment)
  await prisma.booking.create({
    data: {
      fieldId: fields[2].id,
      userId: user.id,
      date: new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + 2)),
      slotId: timeSlots[8].id, // 14:00-15:00
      slotLabel: timeSlots[8].label,
      amount: fields[2].pricePerHour,
      status: 'PENDING'
    }
  })

  // Cancelled booking
  await prisma.booking.create({
    data: {
      fieldId: fields[3].id,
      userId: user.id,
      date: new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() - 2)),
      slotId: timeSlots[7].id, // 13:00-14:00
      slotLabel: timeSlots[7].label,
      amount: fields[3].pricePerHour,
      status: 'CANCELLED',
      cancelledAt: new Date(),
      cancelledBy: 'user',
      cancelReason: 'تغيير في المواعيد'
    }
  })

  console.log('✅ Seed completed successfully!')
  console.log('\n📝 Test Accounts:')
  console.log('👑 Admin: admin@ahgzly.com / admin123')
  console.log('🏢 Owner: owner@ahgzly.com / owner123')
  console.log('👨‍💼 Employee: employee@ahgzly.com / employee123')
  console.log('👤 User: user@ahgzly.com / user123')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
