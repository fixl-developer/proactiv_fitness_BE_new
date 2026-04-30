/**
 * Tiny test seed: ensures one published Session exists in the DB so the
 * parent /book-class flow can be exercised end-to-end. Idempotent — safe
 * to re-run; reuses existing Program/Location/BusinessUnit if present.
 *
 * Run: npx ts-node -r tsconfig-paths/register src/scripts/seed-test-session.ts
 */
import 'dotenv/config'
import mongoose from 'mongoose'

async function main() {
    const uri = process.env.MONGODB_URI
    if (!uri) throw new Error('MONGODB_URI is not set')
    await mongoose.connect(uri)
    console.log('[seed] connected')

    const { Program } = require('../modules/programs/program.model')
    const { Location } = require('../modules/bcms/location.model')
    const { BusinessUnit } = require('../modules/bcms/business-unit.model')
    const { Session, Schedule } = require('../modules/scheduling/schedule.model')
    const { Term } = require('../modules/bcms/term.model')
    const { User } = require('../modules/iam/user.model')

    // Need any user id for createdBy/updatedBy on Schedule
    const sysUser = await User.findOne({ role: 'ADMIN' }).select('_id').lean()
        || await User.findOne({}).select('_id').lean()
    if (!sysUser) throw new Error('No user found in DB to use as createdBy')

    let bu = await BusinessUnit.findOne({ isDeleted: { $ne: true } }).lean()
    if (!bu) {
        bu = await BusinessUnit.create({
            name: 'Test BU',
            code: 'TEST_BU',
            type: 'GYM',
            status: 'active',
            isActive: true,
        })
        console.log('[seed] created BusinessUnit', bu._id)
    } else {
        console.log('[seed] using BusinessUnit', bu._id)
    }

    let location = await Location.findOne({ isDeleted: { $ne: true }, businessUnitId: bu._id }).lean()
    if (!location) {
        location = await Location.create({
            name: 'Test Studio',
            code: 'TEST_LOC',
            businessUnitId: bu._id,
            type: 'studio',
            status: 'active',
            isActive: true,
            address: { street: '1 Test Rd', city: 'Mumbai', country: 'IN' },
        })
        console.log('[seed] created Location', location._id)
    } else {
        console.log('[seed] using Location', location._id)
    }

    let program = await Program.findOne({ isDeleted: { $ne: true } }).lean()
    if (!program) {
        program = await Program.create({
            name: 'Kids Yoga (Test)',
            shortDescription: 'Fun yoga for kids',
            category: 'Kids 6-12',
            programType: 'class',
            skillLevels: ['beginner'],
            ageGroups: [{ min: 6, max: 12 }],
            businessUnitId: bu._id,
            locationIds: [location._id],
            pricingModel: { basePrice: 75, currency: 'HKD' },
            isActive: true,
            isPublic: true,
        })
        console.log('[seed] created Program', program._id)
    } else {
        console.log('[seed] using Program', program._id)
    }

    let term = await Term.findOne({ isDeleted: { $ne: true } }).lean()
    if (!term) {
        term = await Term.create({
            name: 'Test Term',
            code: 'TEST_TERM',
            businessUnitId: bu._id,
            startDate: new Date(),
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            createdBy: sysUser._id,
            updatedBy: sysUser._id,
        })
        console.log('[seed] created Term', term._id)
    } else {
        console.log('[seed] using Term', term._id)
    }

    let schedule = await Schedule.findOne({ status: 'published', isDeleted: { $ne: true } }).lean()
    if (!schedule) {
        schedule = await Schedule.create({
            name: 'Test Schedule',
            termId: term._id,
            businessUnitId: bu._id,
            status: 'published',
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            createdBy: sysUser._id,
            updatedBy: sysUser._id,
        })
        console.log('[seed] created Schedule', schedule._id)
    } else {
        console.log('[seed] using Schedule', schedule._id)
    }

    // Always create a fresh Session for each run so we have something
    // bookable that's not already full from previous runs.
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0)

    // Find any coach for the required coachAssignments[0]
    const coachUser = await User.findOne({ role: 'COACH' }).select('_id').lean()
        || sysUser
    const session = await Session.create({
        sessionId: `SESS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        scheduleId: schedule._id,
        programId: program._id,
        locationId: location._id,
        date: tomorrow,
        timeSlot: {
            startTime: '10:00',
            endTime: '11:00',
            dayOfWeek: tomorrow.getDay(),
        },
        duration: 60,
        maxCapacity: 10,
        enrolledParticipants: [],
        status: 'scheduled',
        coachAssignments: [{
            coachId: coachUser._id,
            role: 'primary',
        }],
        termId: term._id,
        createdBy: sysUser._id,
        updatedBy: sysUser._id,
    })
    console.log('[seed] created Session', session._id, 'on', tomorrow.toISOString())

    await mongoose.disconnect()
    console.log('SESSION_ID=' + session._id)
}

main().catch((e) => {
    console.error('[seed] failed:', e)
    process.exit(1)
})
