// src/composables/generateTestAccount.ts
import { create } from '../controllers/authController'

const testAccounts = [
  { name: 'I am user admin', role: 'UA', password: 'passwordTestAdmin1',  email: 'testadmin@test.com'       },
  { name: 'Platform Mana',   role: 'PM', password: 'passwordTestPM1',     email: 'testpm@test.com'          },
  { name: 'I am Rich',       role: 'DR', password: 'passwordTestDonor',   email: 'testdonor@test.com'       },
  { name: 'I need Money',    role: 'DO', password: 'passwordTestDonee',   email: 'testdonee@test.com'       },
  { name: 'I am Fundraiser', role: 'DR', password: 'passwordTestFR1',     email: 'testfundraiser@test.com'  },
]

export async function generateTestAccounts(): Promise<void> {
  console.log('generateTestAccounts called')

  for (const { name, role, password, email } of testAccounts) {
    console.log('Creating:', email)

    try {
      const userid = await create(name, role, password, email)
      console.log(`Created [${role}] "${name}" → userid ${userid}`)
    } catch (err) {
      console.error(`Failed to create "${name}":`, err)
    }
  }
}


