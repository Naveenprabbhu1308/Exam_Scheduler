require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('./models/User');
const Student  = require('./models/Student');
const Hall     = require('./models/Hall');

const MONGO_URI = process.env.MONGO_URI;

// Tamil name pool
const firstNames = [
  'Arun','Bala','Dinesh','Ganesh','Hari','Karthik','Lokesh','Muthu','Naveen','Prabhu',
  'Rajesh','Suresh','Vimal','Anand','Bharath','Chandru','Deepak','Elan','Firoz','Gopal',
  'Harish','Ilayaraja','Jagadish','Kiran','Lenin','Mahesh','Naresh','Prakash','Ramesh','Senthil',
  'Thilak','Udhay','Vijay','Waran','Xavier','Yogesh','Zafar','Ajith','Babu','Charan',
  'Durai','Eswaran','Faisal','Guru','Hemanth','Imran','Jegan','Kavin','Logesh','Mohan',
  'Nithish','Oviya','Priya','Ragul','Sanjay','Tamilarasan','Uma','Vasanth','Yukesh','Aarav',
  'Aditi','Amala','Anitha','Archana','Bhavani','Deepa','Devi','Ezhil','Geetha','Hema',
  'Indhu','Janani','Kalpana','Lavanya','Malathi','Nivetha','Padma','Revathi','Saranya','Tharani',
  'Usha','Vani','Yamini','Abinaya','Bhuvana','Chithra','Dhivya','Elakkiya','Gowri','Haritha',
  'Iswarya','Jayanthi','Kavitha','Lakshmi','Meena','Nandhini','Pavithra','Reshma','Sivaranjani','Thenmozhi',
  'Vasantha','Vidhya','Pooja','Keerthana','Divya','Sowmya','Nithya','Vinitha','Sangeetha','Priyadharshini',
  'Abishek','Akash','Aravind','Ashwin','Balaji','Dhanush','Gokul','Hariharan','Jeevan','Kalidasan',
  'Madhan','Nirmal','Pavendhan','Ranjith','Saravanan','Tamilselvan','Vignesh','Yazhini','Arjun','Boopathi',
  'Dhanraj','Elangeswaran','Guhan','Iyappan','Jeganath','Kannan','Manimaran','Niranjan','Parthasarathy','Ragavan',
  'Sabari','Tamizhan','Venkat','Yuvraj','Adhithya','Bhuvanesh','Dhamodharan','Elango','Giridhar','Harihara',
  'Isai','Jothi','Kalaiselvan','Manikandan','Nandakumar','Palani','Ramprasad','Selvam','Thangaraj','Vetri',
];

const surnames = ['A','B','C','D','E','G','J','K','M','N','P','R','S','T','V'];

const usedNames = new Set();
const getName = () => {
  let name, tries = 0;
  do {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const sn = surnames[Math.floor(Math.random() * surnames.length)];
    name = `${sn}. ${fn}`;
    tries++;
  } while (usedNames.has(name) && tries < 500);
  usedNames.add(name);
  return name;
};

const DEPTS = [
  { name: 'CSE',         code: 'CS', prefix: 'cs',       staffUser: 'staff.cse',    staffPass: 'cse.staff',    staffName: 'Staff CSE'     },
  { name: 'IT',          code: 'IT', prefix: 'it',       staffUser: 'staff.it',     staffPass: 'it.staff',     staffName: 'Staff IT'      },
  { name: 'MECHATRONICS',code: 'MZ', prefix: 'mz',       staffUser: 'staff.mz',     staffPass: 'mz.staff',     staffName: 'Staff MZ'      },
  { name: 'BIOTECH',     code: 'BT', prefix: 'bt',       staffUser: 'staff.biotech',staffPass: 'biotech.staff',staffName: 'Staff Biotech' },
  { name: 'MECHANICAL',  code: 'ME', prefix: 'me',       staffUser: 'staff.mech',   staffPass: 'mech.staff',   staffName: 'Staff Mech'    },
];

const HALLS = ['A','B','C','D','E','F','G','H','I','J'].map((l) => ({
  name:     `Hall ${l}`,
  capacity: 30,
}));

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Wipe existing data
  await Promise.all([
    User.deleteMany({}),
    Student.deleteMany({}),
    Hall.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  // Create halls
  await Hall.insertMany(HALLS);
  console.log('10 halls created');

  // Create admin
  const adminHash = await bcrypt.hash('admin@bitsathy', 10);
  await User.create({
    name: 'Admin', username: 'admin', password: adminHash,
    role: 'admin', approved: true, department: null,
  });
  console.log('Admin created → admin / admin@bitsathy');

  // Create staff + students per dept
  const studentDocs = [];

  for (const dept of DEPTS) {
    // Staff user
    const staffHash = await bcrypt.hash(dept.staffPass, 10);
    await User.create({
      name:       dept.staffName,
      username:   dept.staffUser,
      password:   staffHash,
      role:       'staff',
      department: dept.name,
      approved:   true,
    });
    console.log(`Staff created → ${dept.staffUser} / ${dept.staffPass}`);

    // 300 students per dept
    for (let seq = 101; seq <= 400; seq++) {
      const rollNo   = `7376231${dept.code}${seq}`;
      const username = `${dept.prefix}${seq}`;
      const password = `${seq}@bit`;
      const hash     = await bcrypt.hash(password, 10);
      const name     = getName();

      // Student in User collection (for login)
      await User.create({
        name, username, password: hash,
        role: 'student', department: dept.name,
        rollNo, approved: true,
      });

      // Student in Student collection (for dashboard/scores)
      studentDocs.push({
        name,
        rollNo,
        email:      `${username}@bitsathy.ac.in`,
        score:      Math.floor(Math.random() * 41) + 60, // 60–100
        totalMarks: Math.floor(Math.random() * 201) + 700,
        maxMarks:   1000,
        department: dept.name,
      });
    }
    console.log(`300 students queued for ${dept.name}`);
  }

  await Student.insertMany(studentDocs);
  console.log(`${studentDocs.length} students inserted into Student collection`);

  console.log('\n✅ Seed complete!');
  console.log('─────────────────────────────────────');
  console.log('Admin  → admin / admin@bitsathy');
  DEPTS.forEach((d) => {
    console.log(`Staff  → ${d.staffUser} / ${d.staffPass}`);
    console.log(`Students → ${d.prefix}101–${d.prefix}400 / 101@bit–400@bit  (dept: ${d.name})`);
  });
  console.log('─────────────────────────────────────');

  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });