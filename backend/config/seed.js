import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './db.js';
import User from '../models/User.js';
import Recruiter from '../models/Recruiter.js';
import Admin from '../models/Admin.js';
import Job from '../models/Job.js';
import CompanyVerification from '../models/CompanyVerification.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables with explicit path
dotenv.config({ path: path.join(__dirname, '../.env') });

// Fallback to default if MONGODB_URI is not set
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/applynepal';
  console.log('Using default MongoDB URI:', process.env.MONGODB_URI);
}

// Create dummy PDF file for resumes
const createDummyResume = (filename) => {
  const resumePath = path.join(__dirname, '../uploads/resumes', filename);
  const resumeDir = path.dirname(resumePath);
  
  if (!fs.existsSync(resumeDir)) {
    fs.mkdirSync(resumeDir, { recursive: true });
  }
  
  // Create a simple text file as placeholder (in production, use actual PDF)
  const dummyContent = `This is a dummy resume file for ${filename}`;
  fs.writeFileSync(resumePath, dummyContent);
  return `uploads/resumes/${filename}`;
};

// Create dummy document file
const createDummyDoc = (filename, dir) => {
  const docPath = path.join(__dirname, '../uploads', dir, filename);
  const docDir = path.dirname(docPath);
  
  if (!fs.existsSync(docDir)) {
    fs.mkdirSync(docDir, { recursive: true });
  }
  
  const dummyContent = `This is a dummy document file for ${filename}`;
  fs.writeFileSync(docPath, dummyContent);
  return docPath;
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Recruiter.deleteMany({});
    await Admin.deleteMany({});
    await Job.deleteMany({});
    await CompanyVerification.deleteMany({});

    console.log('Cleared existing data...');

    // Create Admin
    const admin = await Admin.create({
      email: 'admin@applynepal.com',
      password: 'admin123',
      role: 'admin',
      isActive: true
    });
    console.log('Admin created:', admin.email);

    // Create 5 Job Seekers
    const jobSeekers = [
      {
        fullName: 'Ram Shrestha',
        email: 'ram.shrestha@example.com',
        password: 'Password123',
        phone: '9841234567',
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        experience: '2 years of experience in web development',
        resume: createDummyResume('ram-resume.pdf')
      },
      {
        fullName: 'Sita Maharjan',
        email: 'sita.maharjan@example.com',
        password: 'Password123',
        phone: '9852345678',
        skills: ['Python', 'Django', 'PostgreSQL', 'AWS'],
        experience: '3 years of experience in backend development',
        resume: createDummyResume('sita-resume.pdf')
      },
      {
        fullName: 'Hari Thapa',
        email: 'hari.thapa@example.com',
        password: 'Password123',
        phone: '9863456789',
        skills: ['Java', 'Spring Boot', 'MySQL', 'Microservices'],
        experience: '4 years of experience in Java development',
        resume: createDummyResume('hari-resume.pdf')
      },
      {
        fullName: 'Gita Basnet',
        email: 'gita.basnet@example.com',
        password: 'Password123',
        phone: '9874567890',
        skills: ['Marketing', 'SEO', 'Content Writing', 'Social Media'],
        experience: '2 years of experience in digital marketing',
        resume: createDummyResume('gita-resume.pdf')
      },
      {
        fullName: 'Krishna Tamang',
        email: 'krishna.tamang@example.com',
        password: 'Password123',
        phone: '9885678901',
        skills: ['Sales', 'Customer Relations', 'Business Development'],
        experience: '3 years of experience in sales',
        resume: createDummyResume('krishna-resume.pdf')
      }
    ];

    const createdJobSeekers = await User.insertMany(jobSeekers);
    console.log('Created', createdJobSeekers.length, 'job seekers');

    // Create 3 Recruiters
    const recruitersData = [
      {
        fullName: 'Rajesh Karki',
        email: 'rajesh@techcorp.com',
        password: 'Password123',
        phone: '9811111111',
        companyName: 'TechCorp Nepal',
        companyDescription: 'Leading IT solutions provider in Nepal',
        companyAddress: 'Kathmandu, Nepal',
        companyWebsite: 'https://techcorp.com.np',
        verificationStatus: 'verified',
        verificationDocuments: [
          {
            filename: 'techcorp-doc1.pdf',
            path: 'uploads/documents/techcorp-doc1.pdf',
            uploadedAt: new Date()
          }
        ]
      },
      {
        fullName: 'Sunita Poudel',
        email: 'sunita@financebank.com',
        password: 'Password123',
        phone: '9822222222',
        companyName: 'Finance Bank Ltd',
        companyDescription: 'Premier banking institution in Nepal',
        companyAddress: 'Pokhara, Nepal',
        companyWebsite: 'https://financebank.com.np',
        verificationStatus: 'verified',
        verificationDocuments: [
          {
            filename: 'financebank-doc1.pdf',
            path: 'uploads/documents/financebank-doc1.pdf',
            uploadedAt: new Date()
          }
        ]
      },
      {
        fullName: 'Bikash Gurung',
        email: 'bikash@buildnepal.com',
        password: 'Password123',
        phone: '9833333333',
        companyName: 'Build Nepal Construction',
        companyDescription: 'Quality construction services across Nepal',
        companyAddress: 'Biratnagar, Nepal',
        companyWebsite: 'https://buildnepal.com.np',
        verificationStatus: 'pending',
        verificationDocuments: [
          {
            filename: 'buildnepal-doc1.pdf',
            path: 'uploads/documents/buildnepal-doc1.pdf',
            uploadedAt: new Date()
          }
        ]
      }
    ];

    const createdRecruiters = await Recruiter.insertMany(recruitersData);
    console.log('Created', createdRecruiters.length, 'recruiters');

    // Create Company Verification records
    for (const recruiter of createdRecruiters) {
      // Map 'verified' to 'approved' for CompanyVerification status
      const verificationStatus = recruiter.verificationStatus === 'verified' ? 'approved' : recruiter.verificationStatus;
      
      // Create actual document files
      const documents = recruiter.verificationDocuments.map(doc => {
        const docPath = path.join(__dirname, '../uploads/documents', path.basename(doc.path));
        const docDir = path.dirname(docPath);
        if (!fs.existsSync(docDir)) {
          fs.mkdirSync(docDir, { recursive: true });
        }
        fs.writeFileSync(docPath, `Dummy document content for ${doc.filename}`);
        return doc;
      });
      
      await CompanyVerification.create({
        recruiter: recruiter._id,
        documents: documents,
        status: verificationStatus,
        reviewedBy: recruiter.verificationStatus === 'verified' ? admin._id : null,
        reviewedAt: recruiter.verificationStatus === 'verified' ? new Date() : null
      });
    }
    console.log('Created company verification records');

    // Create 10 Jobs
    const jobs = [
      {
        title: 'Senior Full Stack Developer',
        description: 'We are looking for an experienced Full Stack Developer to join our team. You will be responsible for developing and maintaining web applications using modern technologies.',
        skillsRequired: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express'],
        salaryRange: { min: 80000, max: 120000 },
        experienceRequired: '3-5 years',
        jobType: 'Full-time',
        location: 'Kathmandu',
        category: 'IT',
        companyName: 'TechCorp Nepal',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        postedBy: createdRecruiters[0]._id,
        isActive: true
      },
      {
        title: 'Python Backend Developer',
        description: 'Join our backend team to build scalable APIs and services. Experience with Django and PostgreSQL required.',
        skillsRequired: ['Python', 'Django', 'PostgreSQL', 'REST APIs'],
        salaryRange: { min: 70000, max: 100000 },
        experienceRequired: '1-3 years',
        jobType: 'Full-time',
        location: 'Pokhara',
        category: 'IT',
        companyName: 'TechCorp Nepal',
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        postedBy: createdRecruiters[0]._id,
        isActive: true
      },
      {
        title: 'Banking Officer',
        description: 'We are seeking a Banking Officer to handle customer relations and banking operations.',
        skillsRequired: ['Banking', 'Customer Service', 'Finance'],
        salaryRange: { min: 50000, max: 70000 },
        experienceRequired: '1-3 years',
        jobType: 'Full-time',
        location: 'Pokhara',
        category: 'Banking',
        companyName: 'Finance Bank Ltd',
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        postedBy: createdRecruiters[1]._id,
        isActive: true
      },
      {
        title: 'Financial Analyst',
        description: 'Analyze financial data and prepare reports for management decision making.',
        skillsRequired: ['Finance', 'Analytics', 'Excel', 'Accounting'],
        salaryRange: { min: 60000, max: 90000 },
        experienceRequired: '1-3 years',
        jobType: 'Full-time',
        location: 'Kathmandu',
        category: 'Finance',
        companyName: 'Finance Bank Ltd',
        deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        postedBy: createdRecruiters[1]._id,
        isActive: true
      },
      {
        title: 'Sales Executive',
        description: 'Drive sales growth and build relationships with clients in the banking sector.',
        skillsRequired: ['Sales', 'Communication', 'Customer Relations'],
        salaryRange: { min: 40000, max: 60000 },
        experienceRequired: '1-3 years',
        jobType: 'Full-time',
        location: 'Biratnagar',
        category: 'Sales',
        companyName: 'Finance Bank Ltd',
        deadline: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
        postedBy: createdRecruiters[1]._id,
        isActive: true
      },
      {
        title: 'Digital Marketing Specialist',
        description: 'Develop and execute digital marketing campaigns to increase brand awareness and engagement.',
        skillsRequired: ['Marketing', 'SEO', 'Social Media', 'Content Writing'],
        salaryRange: { min: 45000, max: 65000 },
        experienceRequired: '1-3 years',
        jobType: 'Full-time',
        location: 'Kathmandu',
        category: 'Marketing',
        companyName: 'TechCorp Nepal',
        deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        postedBy: createdRecruiters[0]._id,
        isActive: true
      },
      {
        title: 'Construction Site Engineer',
        description: 'Oversee construction projects and ensure quality standards are met.',
        skillsRequired: ['Construction', 'Engineering', 'Project Management'],
        salaryRange: { min: 55000, max: 75000 },
        experienceRequired: '3-5 years',
        jobType: 'Full-time',
        location: 'Biratnagar',
        category: 'Construction',
        companyName: 'Build Nepal Construction',
        deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        postedBy: createdRecruiters[2]._id,
        isActive: true
      },
      {
        title: 'Nurse',
        description: 'Provide patient care and support in our healthcare facility.',
        skillsRequired: ['Nursing', 'Patient Care', 'Medical Knowledge'],
        salaryRange: { min: 35000, max: 50000 },
        experienceRequired: '1-3 years',
        jobType: 'Full-time',
        location: 'Chitwan',
        category: 'Healthcare',
        companyName: 'TechCorp Nepal',
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        postedBy: createdRecruiters[0]._id,
        isActive: true
      },
      {
        title: 'React Developer Intern',
        description: 'Learn and contribute to our frontend development team. Great opportunity for fresh graduates.',
        skillsRequired: ['React', 'JavaScript', 'HTML', 'CSS'],
        salaryRange: { min: 20000, max: 30000 },
        experienceRequired: '0-1 years',
        jobType: 'Internship',
        location: 'Butwal',
        category: 'IT',
        companyName: 'TechCorp Nepal',
        deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        postedBy: createdRecruiters[0]._id,
        isActive: true
      },
      {
        title: 'Part-time Content Writer',
        description: 'Create engaging content for our website and social media platforms.',
        skillsRequired: ['Content Writing', 'SEO', 'Creative Writing'],
        salaryRange: { min: 25000, max: 40000 },
        experienceRequired: 'Any',
        jobType: 'Part-time',
        location: 'Nepalgunj',
        category: 'Marketing',
        companyName: 'Finance Bank Ltd',
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        postedBy: createdRecruiters[1]._id,
        isActive: true
      }
    ];

    const createdJobs = await Job.insertMany(jobs);
    console.log('Created', createdJobs.length, 'jobs');

    console.log('\n✅ Seed data created successfully!');
    console.log('\nAdmin Credentials:');
    console.log('Email: admin@applynepal.com');
    console.log('Password: admin123');
    console.log('\nJob Seeker Test Accounts:');
    createdJobSeekers.forEach(js => {
      console.log(`Email: ${js.email}, Password: Password123`);
    });
    console.log('\nRecruiter Test Accounts:');
    createdRecruiters.forEach(r => {
      console.log(`Email: ${r.email}, Password: Password123, Status: ${r.verificationStatus}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

