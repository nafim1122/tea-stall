
import React, { useState, useEffect } from 'react';
import { X, CreditCard, Phone, MapPin, Shield, AlertCircle, User, UserPlus } from 'lucide-react';
import { PaymentData } from '../types';
import { useAuth } from '../hooks/useAuth';
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onOrderComplete: (paymentData: PaymentData) => void;
  onLoginRequired?: () => void;
  onRegisterRequired?: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  total,
  onOrderComplete,
  onLoginRequired,
  onRegisterRequired
}) => {
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState<'auth' | 'method' | 'details' | 'success'>('auth');
  const [paymentMethod, setPaymentMethod] = useState('bKash');
  const [formData, setFormData] = useState({
    phone: '',
    otp: '',
    transactionId: '',
    address: '',
    codPhone: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generatedOtp, setGeneratedOtp] = useState('');

  // Security: Input sanitization
  const sanitizeInput = (input: string): string => {
    return input.replace(/[<>]/g, '').trim();
  };

  // Validation functions
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^01[3-9][0-9]{8}$/;
    return phoneRegex.test(phone);
  };

  const validateOTP = (otp: string): boolean => {
    return /^\d{6}$/.test(otp);
  };

  const validateTransactionId = (trxId: string): boolean => {
    return trxId.length >= 8 && trxId.length <= 20;
  };

  // Generate random 6-digit OTP
  const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  useEffect(() => {
    if (!isOpen) {
      resetModal();
    } else {
      // Set initial step based on authentication status
      if (isAuthenticated) {
        setStep('method');
        // Pre-fill user data
        if (user) {
          setFormData(prev => ({
            ...prev,
            phone: user.phone || '',
            codPhone: user.phone || ''
          }));
        }
      } else {
        setStep('auth');
      }
    }
  }, [isOpen, isAuthenticated, user]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
    setIsLoading(false);
    setErrors({});
    setGeneratedOtp('');
  };

  const handleClose = () => {
    if (!isLoading) {
      resetModal();
      onClose();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    const sanitizedValue = sanitizeInput(value);
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const sendOTP = async () => {
    if (!validatePhone(formData.phone)) {
      setErrors({ phone: 'Please enter a valid phone number' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Generate OTP
      const otp = generateOTP();
      setGeneratedOtp(otp);
      
      // Simulate API call to send SMS
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setOtpSent(true);
      toast.success(`OTP sent to ${formData.phone}! Your OTP is: ${otp}`);
      console.log(`OTP sent to ${formData.phone}: ${otp}`);
    } catch (error) {
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = (otpValue: string): boolean => {
    return otpValue === generatedOtp;
  };

  const handleMethodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    
    try {
      if (paymentMethod === 'COD') {
        // Validate COD fields
        const newErrors: Record<string, string> = {};
        
        if (!formData.address.trim()) {
          newErrors.address = 'Delivery address is required';
        }
        
        if (!validatePhone(formData.codPhone)) {
          newErrors.codPhone = 'Please enter a valid phone number';
        }
        
        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
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

      // Validate mobile payment fields
      const newErrors: Record<string, string> = {};
      
      if (!validatePhone(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }
      
      if (!otpSent) {
        newErrors.otp = 'Please request OTP first';
      } else if (!validateOTP(formData.otp)) {
        newErrors.otp = 'Please enter a valid 6-digit OTP';
      } else if (!verifyOTP(formData.otp)) {
        newErrors.otp = 'Invalid OTP. Please check and try again.';
      }

      if (!formData.address.trim()) {
        newErrors.address = 'Delivery address is required';
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setStep('details');
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    
    try {
      if (!validateTransactionId(formData.transactionId)) {
        setErrors({ transactionId: 'Please enter a valid transaction ID' });
        return;
      }

      const paymentData: PaymentData = {
        paymentMethod,
        transactionId: formData.transactionId,
        phone: formData.phone,
        address: formData.address
      };

      onOrderComplete(paymentData);
      setStep('success');
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">🍵</span>
            </div>
            <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Payment</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            title="Close payment modal"
            aria-label="Close payment modal"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {/* Total Amount */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-6 border border-green-100">
            <div className="text-center">
              <p className="text-gray-600 mb-1 text-sm sm:text-base">Total Amount</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">৳{total}</p>
            </div>
          </div>

          {/* Authentication Step */}
          {step === 'auth' && (
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <User className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Secure Your Order
                </h3>
                <p className="text-gray-600">
                  Sign in or create an account to proceed with your order safely and track your purchase history.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Benefits of Creating an Account:</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Track your order status</li>
                    <li>• Faster checkout next time</li>
                    <li>• Order history and reordering</li>
                    <li>• Exclusive member offers</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => {
                      onClose();
                      onLoginRequired?.();
                    }}
                    className="bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <User className="h-5 w-5" />
                    <span>Sign In to Existing Account</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      onClose();
                      onRegisterRequired?.();
                    }}
                    className="bg-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <UserPlus className="h-5 w-5" />
                    <span>Create New Account</span>
                  </button>
                </div>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-4 text-gray-500">or</span>
                  </div>
                </div>

                <button
                  onClick={() => setStep('method')}
                  className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Continue as Guest
                </button>
              </div>
            </div>
          )}

          {step === 'method' && (
            <form onSubmit={handleMethodSubmit} className="space-y-6">
              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <Shield className="inline h-4 w-4 mr-1" />
                  Select Payment Method
                </label>
                <div className="space-y-3">
                  {['bKash', 'Nagad', 'COD'].map((method) => (
                    <label key={method} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="payment-method"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-green-600 focus:ring-green-500"
                      />
                      <span className="font-medium text-sm sm:text-base">
                        {method === 'COD' ? 'Cash on Delivery' : method}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Address Field - Common for all payment methods */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Delivery Address *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  required
                  rows={3}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full delivery address"
                  maxLength={500}
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.address}
                  </p>
                )}
              </div>

              {paymentMethod === 'COD' ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.codPhone}
                    onChange={(e) => handleInputChange('codPhone', e.target.value)}
                    required
                    pattern="01[3-9][0-9]{8}"
                    maxLength={11}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base ${
                      errors.codPhone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="01XXXXXXXXX"
                  />
                  {errors.codPhone && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.codPhone}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Phone className="h-4 w-4 inline mr-1" />
                      Mobile Number *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        required
                        pattern="01[3-9][0-9]{8}"
                        maxLength={11}
                        className={`flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="01XXXXXXXXX"
                      />
                      <button
                        type="button"
                        onClick={sendOTP}
                        disabled={otpSent || isLoading || !formData.phone}
                        className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base whitespace-nowrap"
                      >
                        {isLoading ? 'Sending...' : otpSent ? 'Sent' : 'Get OTP'}
                      </button>
                    </div>
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {otpSent && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Enter OTP Code *
                      </label>
                      <div className="flex justify-center">
                        <InputOTP
                          maxLength={6}
                          value={formData.otp}
                          onChange={(value) => handleInputChange('otp', value)}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      {errors.otp && (
                        <p className="text-red-500 text-xs mt-2 text-center flex items-center justify-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.otp}
                        </p>
                      )}
                      <p className="text-center text-xs text-gray-500 mt-2">
                        Enter the 6-digit code sent to your phone
                      </p>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : paymentMethod === 'COD' ? 'Place Order' : 'Next'}
              </button>
            </form>
          )}

          {step === 'details' && (
            <form onSubmit={handleTransactionSubmit} className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
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
                  Transaction ID *
                </label>
                <input
                  type="text"
                  value={formData.transactionId}
                  onChange={(e) => handleInputChange('transactionId', e.target.value)}
                  required
                  maxLength={20}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base ${
                    errors.transactionId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter Transaction ID"
                />
                {errors.transactionId && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.transactionId}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Complete Payment'}
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
