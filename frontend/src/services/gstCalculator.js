export const calculateGST = (companyStateCode, customerStateCode, gstRate, amount) => {
  const isIntraState = companyStateCode === customerStateCode;
  
  if (isIntraState) {
    const halfRate = gstRate / 2;
    const cgst = (amount * halfRate) / 100;
    const sgst = (amount * halfRate) / 100;
    return {
      cgst: parseFloat(cgst.toFixed(2)),
      sgst: parseFloat(sgst.toFixed(2)),
      igst: 0,
      totalGst: parseFloat((cgst + sgst).toFixed(2)),
      totalAmount: parseFloat((amount + cgst + sgst).toFixed(2)),
      isIntraState: true
    };
  } else {
    const igst = (amount * gstRate) / 100;
    return {
      cgst: 0,
      sgst: 0,
      igst: parseFloat(igst.toFixed(2)),
      totalGst: parseFloat(igst.toFixed(2)),
      totalAmount: parseFloat((amount + igst).toFixed(2)),
      isIntraState: false
    };
  }
};

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];
