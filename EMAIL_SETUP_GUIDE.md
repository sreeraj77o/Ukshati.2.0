# Purchase Order Email Setup Guide

This guide explains how to configure the email functionality for sending Purchase Order PDFs to vendors.

## Overview

The email functionality allows users to send Purchase Order PDFs directly to vendors via email from the AllOrders page. When the "Send Order" button is clicked, a modal opens allowing the user to send the PO via email or WhatsApp.

## Features Implemented

1. **Email Integration**: Send PO PDFs as email attachments
2. **Automatic Vendor Email Detection**: Pre-fills vendor email if available
3. **Manual Email Entry**: Allows manual email entry if vendor email is not available
4. **Professional Email Template**: HTML-formatted email with company branding
5. **Error Handling**: Comprehensive error handling with user-friendly messages
6. **File Cleanup**: Automatic cleanup of temporary PDF files

## Setup Instructions

### 1. Email Configuration

Update the `.env` file with your email credentials:

```env
# Email Configuration for Purchase Order Sending
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 2. Gmail Setup (Recommended)

For Gmail, you need to use App Passwords:

1. **Enable 2-Factor Authentication**:
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Navigate to Security > 2-Step Verification
   - Enable if not already enabled

2. **Generate App Password**:
   - Go to Security > App passwords
   - Select "Mail" as the app
   - Generate a 16-character password
   - Use this password as `EMAIL_PASS` in your `.env` file

3. **Update Environment Variables**:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ```

### 3. Alternative Email Providers

For other email providers, update the transporter configuration in `/frontend/pages/api/send-po-email.js`:

```javascript
// For Outlook/Hotmail
const transporter = nodemailer.createTransporter({
  service: "hotmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// For custom SMTP
const transporter = nodemailer.createTransporter({
  host: "your-smtp-server.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

## How It Works

### 1. User Flow

1. User navigates to AllOrders page (`/purchase-order/orders/AllOrders`)
2. User clicks the "Send Order" button (checkmark icon) for a specific order
3. ShareOrderModal opens with email and WhatsApp options
4. User selects "Email" method
5. If vendor has email, it's pre-filled; otherwise user enters email manually
6. User clicks "Send" button
7. System generates PDF and sends email with attachment

### 2. Technical Flow

1. **PDF Generation**: `generatePurchaseOrderPDF()` creates PDF blob
2. **Form Data**: PDF blob and email details sent to `/api/send-po-email`
3. **Email Sending**: Nodemailer sends email with PDF attachment
4. **Cleanup**: Temporary files are cleaned up
5. **Response**: Success/error message returned to user

## Files Modified/Created

### Modified Files:
- `frontend/package.json` - Added formidable and nodemailer dependencies
- `frontend/pages/purchase-order/orders/AllOrders.js` - Added vendor email to share modal
- `frontend/components/ShareOrderModal.js` - Enhanced email handling
- `frontend/components/purchase/PurchaseOrderPDF.js` - Added blob return option
- `frontend/lib/shareOrderEmail.js` - Improved PDF generation and error handling
- `frontend/pages/api/send-po-email.js` - Complete rewrite with better error handling

### Created Files:
- `.env.example` - Environment variables template
- `EMAIL_SETUP_GUIDE.md` - This documentation file

## Troubleshooting

### Common Issues:

1. **"Email configuration not found"**
   - Ensure `EMAIL_USER` and `EMAIL_PASS` are set in `.env` file
   - Restart the development server after updating `.env`

2. **"Email authentication failed"**
   - Verify Gmail App Password is correct
   - Ensure 2-Factor Authentication is enabled on Gmail
   - Check that EMAIL_USER is the correct Gmail address

3. **"Failed to connect to email server"**
   - Check internet connection
   - Verify firewall settings
   - Try different email service provider

4. **"Invalid recipient email address"**
   - Ensure email address format is correct
   - Check if recipient email exists

### Testing:

1. **Test with your own email first**:
   - Send a PO to your own email address
   - Verify PDF attachment is received correctly

2. **Check server logs**:
   - Monitor console for detailed error messages
   - Check `/home/charan/.npm/_logs/` for npm-related issues

3. **Verify vendor email data**:
   - Ensure vendors have email addresses in the database
   - Check vendor management page for email field

## Security Considerations

1. **Environment Variables**: Never commit actual email credentials to version control
2. **App Passwords**: Use App Passwords instead of regular passwords
3. **File Cleanup**: Temporary PDF files are automatically cleaned up
4. **Rate Limiting**: Consider implementing rate limiting for email sending
5. **Validation**: Email addresses are validated before sending

## Future Enhancements

1. **Email Templates**: Customizable email templates
2. **Bulk Sending**: Send multiple POs at once
3. **Email Tracking**: Track email delivery status
4. **Attachment Options**: Include additional documents
5. **Email Scheduling**: Schedule emails for later delivery

## Support

If you encounter issues:
1. Check this documentation first
2. Verify environment variables are correctly set
3. Test with a simple email first
4. Check server logs for detailed error messages
5. Ensure all dependencies are installed correctly
