
import React, { useState } from 'react';
import { X, CreditCard, Phone, MapPin } from 'lucide-react';
import { PaymentData } from '../types';
import { toast } from "sonner";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onOrderComplete: (paymentData: PaymentData) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  total,
  onOrderComplete
}) => {
  const [step, setStep] = useState<'method' | 'details' | 'success'>('method');
  const [paymentMethod, setPaymentMethod] = useState('bKash');
  const [formData, setFormData] = useState({
    phone: '',
    otp: '',
    transactionId: '',
    address: '',
    codPhone: ''
  });
  const [otpSent, setOtpSent] = useState(false);

  if (!isOpen) return null;

  const resetModal = () => {
    setStep('method');
    setPaymentMethod('bKash');
    setFormData({
      phone: '',
      otp: '',
      transactionId: '',
      address: '',
      codPhone: ''
    });
    setOtpSent(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const sendOTP = () => {
    if (!/^01[3-9][0-9]{8}$/.test(formData.phone)) {
      toast.error('Please enter a valid phone number');
      return;
    }
    setOtpSent(true);
    setFormData(prev => ({ ...prev, otp: '123456' })); // Demo OTP
    toast.success('OTP sent successfully!');
  };

  const handleMethodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod === 'COD') {
      if (!formData.address.trim() || !/^01[3-9][0-9]{8}$/.test(formData.codPhone)) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      const paymentData: PaymentData = {
        paymentMethod: 'Cash on Delivery',
        address: formData.address,
        phone: formData.codPhone
      };
      
      onOrderComplete(paymentData);
      setStep('success');
      return;
    }

    if (!/^01[3-9][0-9]{8}$/.test(formData.phone)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    if (!otpSent || formData.otp !== '123456') {
      toast.error('Please verify OTP first');
      return;
    }

    setStep('details');
  };

  const handleTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.transactionId.trim()) {
      toast.error('Please enter transaction ID');
      return;
    }

    const paymentData: PaymentData = {
      paymentMethod,
      transactionId: formData.transactionId,
      phone: formData.phone
    };

    onOrderComplete(paymentData);
    setStep('success');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-800">Payment</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          {/* Total Amount */}
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <div className="text-center">
              <p className="text-gray-600 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-green-600">৳{total}</p>
            </div>
          </div>

          {step === 'method' && (
            <form onSubmit={handleMethodSubmit} className="space-y-6">
              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Payment Method
                </label>
                <div className="space-y-3">
                  {['bKash', 'Nagad', 'COD'].map((method) => (
                    <label key={method} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="payment-method"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-green-600 focus:ring-green-500"
                      />
                      <span className="font-medium">
                        {method === 'COD' ? 'Cash on Delivery' : method}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {paymentMethod === 'COD' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      Delivery Address
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      required
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter your full delivery address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Phone className="h-4 w-4 inline mr-1" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.codPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, codPhone: e.target.value }))}
                      required
                      pattern="01[3-9][0-9]{8}"
                      maxLength={11}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="01XXXXXXXXX"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Phone className="h-4 w-4 inline mr-1" />
                      Mobile Number
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        required
                        pattern="01[3-9][0-9]{8}"
                        maxLength={11}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="01XXXXXXXXX"
                      />
                      <button
                        type="button"
                        onClick={sendOTP}
                        disabled={otpSent}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {otpSent ? 'Sent' : 'Get OTP'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      OTP Code
                    </label>
                    <input
                      type="text"
                      value={formData.otp}
                      onChange={(e) => setFormData(prev => ({ ...prev, otp: e.target.value }))}
                      required
                      maxLength={6}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter 6-digit OTP"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
              >
                {paymentMethod === 'COD' ? 'Place Order' : 'Next'}
              </button>
            </form>
          )}

          {step === 'details' && (
            <form onSubmit={handleTransactionSubmit} className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Payment Instructions</h3>
                <p className="text-blue-700 text-sm mb-2">
                  <strong>{paymentMethod} Number:</strong> {paymentMethod === 'bKash' ? '017XXXXXXXX' : '018XXXXXXXX'}
                </p>
                <p className="text-blue-700 text-sm">
                  Send ৳{total} to the above number and enter your Transaction ID below.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Transaction ID
                </label>
                <input
                  type="text"
                  value={formData.transactionId}
                  onChange={(e) => setFormData(prev => ({ ...prev, transactionId: e.target.value }))}
                  required
                  maxLength={20}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter Transaction ID"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
              >
                Complete Payment
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">✓</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h3>
              <p className="text-gray-600 mb-6">
                {paymentMethod === 'Cash on Delivery' 
                  ? 'Your order has been placed. Please pay cash on delivery.'
                  : 'Thank you for your order. We will process it shortly.'
                }
              </p>
              <button
                onClick={handleClose}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
