# Purchase Order System - SMARTEDGE AUTOMATION

## Overview
This is a comprehensive Purchase Order management system designed for SMARTEDGE AUTOMATION, specializing in Industrial Automation and CNC Services.

## Features

### 📋 Complete Purchase Order Form
- **Company Details**: Pre-filled SMARTEDGE AUTOMATION information
- **PO Information**: PO Number, Date, Reference details
- **Supplier Management**: Complete supplier details and contact information
- **Shipping Address**: Fixed shipping address for SMARTEDGE AUTOMATION

### 🧮 Dynamic Item Management
- Add/Remove items dynamically
- Automatic calculations for:
  - Amount (Qty × Rate)
  - Discount application
  - Total per item
  - Grand totals

### 💰 Tax Calculations
- **SGST**: 9% State Goods and Services Tax
- **CGST**: 9% Central Goods and Services Tax  
- **IGST**: 18% Integrated Goods and Services Tax
- **Packing**: 2% of subtotal
- **Freight**: 3% of subtotal

### 🖨️ Print-Ready Format
- Professional invoice layout
- Print-friendly CSS styles
- Hides form controls in print mode
- Proper formatting for official documents

### 🔢 Additional Features
- Number to words conversion for amounts
- Terms and conditions section
- Payment terms management
- Authorized signatory section
- Responsive design

## File Structure

```
po/
├── PurchaseOrderForm.jsx      # Main purchase order form component
├── PurchaseOrderDemo.jsx      # Demo component with features showcase
├── PurchaseOrder.module.css   # Styling and print-friendly CSS
├── entry/
│   └── index.jsx             # Entry point component
├── details/
│   └── index.jsx             # PO details view
└── README.md                 # This documentation
```

## Usage

### Basic Implementation
```jsx
import PurchaseOrderForm from './PurchaseOrderForm'

function App() {
  return <PurchaseOrderForm />
}
```

### With Demo Features
```jsx
import PurchaseOrderDemo from './PurchaseOrderDemo'

function App() {
  return <PurchaseOrderDemo />
}
```

## Form Fields

### Company Information (Pre-filled)
- Company Name: SMARTEDGE AUTOMATION
- Address: #389, 3rd Main Road, 2nd Stage, K.H.B Colony, Basaveshwaranagar, Bangalore - 560079
- Phone: 080 23285927
- GSTIN: 29ABHFS7657M1Z7
- PAN: ABHFS7657M
- Email: smartedgeautomation@gmail.com

### Purchase Order Details
- PO Number (Required)
- PO Date (Required)
- Your Reference
- Reference Date
- Project/Work Order Number

### Supplier Information
- Supplier Name (Required)
- Supplier Address (Required)
- Kind Attention
- Contact Details

### Item Details
- Description
- Type
- HSN/SAC Code
- Make
- Quantity
- Unit (Nos, Kg, Mtr, Ltr, Set)
- Rate per Unit
- Amount (Auto-calculated)
- Discount %
- Total (Auto-calculated)

### Terms & Conditions
- Freight Terms
- Payment Terms
- Advance Amount
- Cheque Details
- Delivery Terms

## Calculations

### Item Level
```
Amount = Quantity × Rate per Unit
Total = Amount - (Amount × Discount%)
```

### Order Level
```
Subtotal = Sum of all item totals
Packing = Subtotal × 2%
Freight = Subtotal × 3%
Taxable Amount = Subtotal + Packing + Freight
SGST = Taxable Amount × 9%
CGST = Taxable Amount × 9%
Grand Total = Taxable Amount + SGST + CGST
```

## Print Functionality
The system includes comprehensive print styles that:
- Hide form controls and buttons
- Show only values in a clean format
- Maintain professional invoice appearance
- Include proper borders and spacing
- Display company branding and signatures

## Dependencies
- React 18+
- Ant Design 5+
- @ant-design/icons

## Customization
The system can be easily customized by:
1. Modifying company details in the form
2. Adjusting tax rates in the calculation logic
3. Updating styling in the CSS module
4. Adding new form fields as needed

## Browser Support
- Chrome (recommended for printing)
- Firefox
- Safari
- Edge

## Notes
- The system uses Indian tax structure (SGST/CGST/IGST)
- Currency is in Indian Rupees (₹)
- Number to words conversion supports Indian numbering system
- Print functionality works best in Chrome browser