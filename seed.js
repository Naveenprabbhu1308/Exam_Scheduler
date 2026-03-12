require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./models/User');
const Student  = require('./models/Student');
const Hall     = require('./models/Hall');

const MONGO_URI = process.env.MONGO_URI;

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
  { name:'CSE',         code:'CS', prefix:'cs', staffUser:'staff.cse',    staffPass:'cse.staff',    staffName:'Staff CSE'     },
  { name:'IT',          code:'IT', prefix:'it', staffUser:'staff.it',     staffPass:'it.staff',     staffName:'Staff IT'      },
  { name:'MECHATRONICS',code:'MZ', prefix:'mz', staffUser:'staff.mz',     staffPass:'mz.staff',     staffName:'Staff MZ'      },
  { name:'BIOTECH',     code:'BT', prefix:'bt', staffUser:'staff.biotech',staffPass:'biotech.staff',staffName:'Staff Biotech' },
  { name:'MECHANICAL',  code:'ME', prefix:'me', staffUser:'staff.mech',   staffPass:'mech.staff',   staffName:'Staff Mech'    },
];

const HALLS = ['A','B','C','D','E','F','G','H','I','J'].map((l) => ({ name:`Hall ${l}`, capacity:30 }));

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  await Promise.all([User.deleteMany({}), Student.deleteMany({}), Hall.deleteMany({})]);
  console.log('Cleared existing data');

  await Hall.insertMany(HALLS);
  console.log('10 halls created');

  await User.create({ name:'Admin', username:'admin', password:'admin@bitsathy', role:'admin', approved:true, department:null });
  console.log('Admin created → admin / admin@bitsathy');

  const studentDocs = [];

  for (const dept of DEPTS) {
    await User.create({ name:dept.staffName, username:dept.staffUser, password:dept.staffPass, role:'staff', department:dept.name, approved:true });
    console.log(`Staff → ${dept.staffUser} / ${dept.staffPass}`);

    const userDocs = [];
    for (let seq = 101; seq <= 400; seq++) {
      const rollNo   = `7376231${dept.code}${seq}`;
      const username = `${dept.prefix}${seq}`;
      const name     = getName();
      userDocs.push({ name, username, password:`${seq}@bit`, role:'student', department:dept.name, rollNo, approved:true });
      studentDocs.push({
        name, rollNo,
        email:      `${username}@bitsathy.ac.in`,
        score:      Math.floor(Math.random() * 41) + 60,
        totalMarks: Math.floor(Math.random() * 201) + 700,
        maxMarks:   1000,
        department: dept.name,
      });
    }

    let count = 0;
    for (const u of userDocs) {
      try { await User.create(u); count++; }
      catch (err) { console.error(`  ❌ ${u.username}: ${err.message}`); }
    }
    console.log(`  ✅ ${count}/300 users created for ${dept.name}`);
  }

  await Student.insertMany(studentDocs);
  console.log(`\n✅ ${studentDocs.length} students inserted`);
  console.log('Admin  → admin / admin@bitsathy');
  DEPTS.forEach((d) => console.log(`Staff  → ${d.staffUser} / ${d.staffPass} | Students → ${d.prefix}101-400 / 101@bit-400@bit`));

  await mongoose.disconnect();
  console.log('Done!');
}

seed().catch((err) => { console.error('Seed failed:', err); process.exit(1); });