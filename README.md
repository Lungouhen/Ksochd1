# KSO Chandigarh Organization Portal 🎓

[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=flat&logo=google&logoColor=white)](https://developers.google.com/apps-script)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-success)](https://github.com)
[![Session](https://img.shields.io/badge/Session-2026--2027-blue)](https://github.com)

Complete professional membership management portal for **Kuki Students' Organisation (KSO) Chandigarh** built with Google Apps Script, Google Sheets, and modern web technologies.

---

## 🌟 Features

### Core Membership Management
- ✅ **Individual & Family Membership Forms** with complete validation
- ✅ **Photo Upload** with Google Drive integration
- ✅ **Auto-generated Enrollment Numbers** (KSOI2026-XXXX, KSOF2026-XXXX)
- ✅ **Member Approval Workflow** (Pending → Approved/Rejected)
- ✅ **Email Notifications** (Registration, Approval, Payment)
- ✅ **Payment Processing** with automatic receipt generation

### Admin Dashboard
- 🔐 **Role-based Access Control** (Admin, President, General Secretary, Treasurer)
- 📊 **Real-time Statistics** and analytics
- 👥 **Member Management** with search, filter, and export
- 💰 **Financial Management** with payment tracking
- 📅 **Event Management** system
- 📢 **Announcement System**
- 📈 **Reports & Analytics**

### 20+ Enhanced Features
1. **Event Management** - Create and track organizational events
2. **Attendance Tracking** - Digital attendance for events
3. **Announcement System** - Broadcast important updates
4. **Document Repository** - Centralized document storage
5. **Committee Management** - Assign and track committee roles
6. **Membership Renewal** - Automated renewal tracking
7. **Donation Management** - Track donations with receipts
8. **Certificate Generation** - Digital certificates for members
9. **Skills Database** - Member skills and expertise tracking
10. **Job Board** - Job postings for members
11. **Volunteer Hours** - Community service tracking
12. **Poll/Voting System** - Democratic decision making
13. **Meeting Minutes** - Record keeping for meetings
14. **Birthday Reminders** - Automatic birthday tracking
15. **Bulk Email System** - Mass communication tool
16. **Member Directory** - Searchable member database
17. **Fee Management** - Dynamic fee structure
18. **ID Card Generation** - Digital ID cards with QR codes
19. **Data Backup** - One-click backup system
20. **Audit Logs** - Complete activity tracking
21. **Advanced Search** - Multi-field search capability
22. **Payment History** - Complete financial records
23. **Analytics Dashboard** - Visual data insights
24. **Mobile Responsive** - Works on all devices

---

## 🚀 Quick Start

### Prerequisites
- Google Account
- Admin access to create Google Sheets
- Basic understanding of Google Apps Script

### Installation (5 Minutes)

1. **Create a new Google Spreadsheet**
   - Go to [Google Sheets](https://sheets.google.com)
   - Create a blank spreadsheet
   - Name it: "KSO Chandigarh Portal 2026-2027"

2. **Open Apps Script Editor**
   - Click **Extensions** > **Apps Script**
   - Delete default code

3. **Add Project Files**
   - Copy and paste `Code.gs` into the editor
   - Create 5 HTML files: `Home`, `FormIndividual`, `FormFamily`, `Login`, `Dashboard`
   - Paste respective HTML code into each file

4. **Initialize Database**
   - Select `initializeDatabase` function
   - Click **Run** ▶️
   - Authorize the script when prompted

5. **Deploy as Web App**
   - Click **Deploy** > **New deployment**
   - Select type: **Web app**
   - Execute as: **Me**
   - Access: **Anyone**
   - Click **Deploy**
   - Copy the Web App URL

6. **Done!** 🎉
   - Visit your Web App URL
   - Default admin login: `admin@ksocandigarh.org` / `admin123`

📖 **For detailed setup instructions, see [SETUP.md](./SETUP.md)**

---

## 📁 Project Structure

```
KSO-Portal/
├── Code.gs              # Backend logic (Google Apps Script)
├── Home.html            # Public homepage
├── FormIndividual.html  # Individual membership form
├── FormFamily.html      # Family membership form
├── Login.html           # Admin login page
├── Dashboard.html       # Admin dashboard
├── SETUP.md            # Complete setup guide
└── README.md           # This file
```

---

## 💾 Database Schema

The portal automatically creates 20+ sheets:

| Sheet | Purpose |
|-------|---------|
| **Individual** | Individual member records |
| **Family** | Family membership records |
| **Payments** | Payment transactions |
| **Admins** | Admin user accounts |
| **Settings** | System configuration |
| **Logs** | Audit trail |
| **Events** | Event information |
| **Attendance** | Event attendance records |
| **Announcements** | Organization announcements |
| **Documents** | Document repository |
| **Committees** | Committee assignments |
| **Renewals** | Membership renewals |
| **Donations** | Donation records |
| **Certificates** | Issued certificates |
| **Skills** | Member skills database |
| **Jobs** | Job board postings |
| **Volunteers** | Volunteer hour logs |
| **Polls** | Poll questions |
| **PollVotes** | Poll responses |
| **Meetings** | Meeting minutes |

---

## 🎨 Technology Stack

### Backend
- **Google Apps Script** - Server-side logic
- **Google Sheets API** - Database
- **Gmail API** - Email notifications
- **Google Drive API** - Photo storage

### Frontend
- **HTML5** - Structure
- **Tailwind CSS** - Styling
- **JavaScript** - Interactivity
- **Font Awesome** - Icons

---

## 🔐 Security Features

- ✅ **Role-based Access Control** (RBAC)
- ✅ **Session Management** with cache
- ✅ **Protected Admin Routes**
- ✅ **Input Validation** on forms
- ✅ **Audit Logging** for all actions
- ✅ **Secure Password Storage** (basic)

⚠️ **Important**: Change default admin password immediately after setup!

---

## 👥 User Roles

| Role | Capabilities |
|------|-------------|
| **Admin** | Full system access, database management, user management |
| **President** | Member approvals, event management, committee assignments |
| **General Secretary** | Announcements, communications, event coordination |
| **Treasurer** | Payment management, financial reports, donation tracking |

---

## 📧 Email Notifications

Automatic emails sent for:
- ✅ Registration confirmation
- ✅ Application approval/rejection
- ✅ Payment receipt
- ✅ Event reminders
- ✅ Birthday wishes
- ✅ Membership renewal reminders

---

## 📊 Dashboard Features

### Statistics Cards
- Total Members
- Pending Approvals
- Total Revenue
- Pending Payments

### Recent Activities
- Live activity feed
- Action tracking
- User attribution

### Quick Actions
- Approve members
- Record payments
- Create events
- Post announcements
- Export data

---

## 🎯 Use Cases

### For Members
1. Apply for membership online
2. Upload photo during registration
3. Receive instant confirmation email
4. Get notified when approved
5. Access member benefits

### For Admins
1. Review and approve applications
2. Record payments and issue receipts
3. Create and manage events
4. Send announcements to members
5. Generate reports and analytics
6. Export data for external use

### For Organization
1. Digital membership management
2. Automated workflows
3. Financial tracking
4. Event coordination
5. Member engagement
6. Data-driven decisions

---

## 📱 Mobile Responsive

The portal is fully responsive and works seamlessly on:
- 📱 Smartphones
- 📲 Tablets
- 💻 Laptops
- 🖥️ Desktops

---

## 🔄 Workflow

### Member Registration Flow
```
Member fills form → System validates → Auto-generate enrollment number
→ Store in database → Send confirmation email → Admin reviews
→ Approve/Reject → Email notification → Member pays fee
→ Admin records payment → Receipt generated → Email receipt
→ Membership active ✅
```

### Event Management Flow
```
Admin creates event → System stores details → Members notified
→ Members register → Attendance tracked → Post-event report
```

---

## 📈 Analytics & Reports

The portal provides insights on:
- Membership growth trends
- Gender distribution
- Institution-wise breakdown
- Payment collection status
- Event attendance rates
- Top volunteer contributors
- Skills availability
- Financial summaries

---

## 🛠️ Customization

### Change Membership Fees
Edit `CONFIG` object in `Code.gs`:
```javascript
const CONFIG = {
  INDIVIDUAL_FEE: 500,  // Change amount
  FAMILY_FEE: 1500,     // Change amount
};
```

### Change Organization Name
Update in `CONFIG` and HTML files.

### Modify Colors
Edit Tailwind CSS classes in HTML files.

### Add Custom Fields
1. Add column to sheet
2. Update form HTML
3. Modify submission function

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: Authorization error
- **Fix**: Run `initializeDatabase` and complete authorization

**Issue**: Forms not submitting
- **Fix**: Deploy new version of web app

**Issue**: Emails not sending
- **Fix**: Check Gmail quota (100/day)

**Issue**: Photos not uploading
- **Fix**: Set `DRIVE_FOLDER_ID` in Script Properties

📖 **More solutions in [SETUP.md](./SETUP.md)**

---

## 📝 To-Do / Future Enhancements

- [ ] WhatsApp integration for notifications
- [ ] SMS gateway integration
- [ ] PDF certificate generation
- [ ] Advanced analytics with charts
- [ ] Member portal (self-service)
- [ ] Mobile app (PWA)
- [ ] Payment gateway integration
- [ ] Biometric attendance
- [ ] AI-powered insights

---

## 🤝 Contributing

This project is specifically built for KSO Chandigarh. If you're from another student organization and want to adapt this:

1. Fork the repository
2. Modify organization details
3. Customize features as needed
4. Deploy to your Google account

---

## 📄 License

© 2026 Kuki Students' Organisation (KSO) Chandigarh. All rights reserved.

This software is proprietary to KSO Chandigarh for the 2026-2027 session.

---

## 📞 Support

**Technical Support**:
- Email: admin@ksocandigarh.org
- Documentation: [SETUP.md](./SETUP.md)

**Organization**:
- Website: (Add your website)
- Facebook: (Add your page)
- Instagram: (Add your handle)

---

## 🙏 Acknowledgments

Built with ❤️ for KSO Chandigarh

**Technologies**:
- Google Apps Script
- Google Workspace APIs
- Tailwind CSS
- Font Awesome

**Special Thanks**:
- KSO Chandigarh Executive Committee
- All contributing members

---

## 📊 Project Stats

- **Lines of Code**: 2,000+
- **Features**: 40+
- **HTML Pages**: 5
- **Database Tables**: 20+
- **Functions**: 100+
- **Email Templates**: 5

---

## 🎓 About KSO Chandigarh

The **Kuki Students' Organisation (KSO)** Chandigarh is a dedicated student organization serving the Kuki community in Chandigarh. We provide:

- 🤝 Community support and networking
- 📚 Educational resources and guidance
- 🎉 Cultural events and activities
- 💼 Career development opportunities
- 🏆 Leadership training
- 🌟 Academic excellence programs

**Session**: 2026-2027

---

## 🚀 Getting Started

Ready to launch your portal?

1. ⭐ Star this repository
2. 📖 Read [SETUP.md](./SETUP.md)
3. 🛠️ Follow the 5-minute installation
4. 🎉 Start managing your organization!

---

**Made with 💙 by the KSO Chandigarh Tech Team**

*Last Updated: May 2026*