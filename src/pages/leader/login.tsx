import React, {  useState } from 'react';
import { AlertCircle, User, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- TYPE DEFINITIONS ---

// Types for Leader and Citizen Login
interface LoginFormData {
    identifier: string;
    password: string;
}

interface LoginErrors {
    identifier: string;
    password: string;
    general: string;
}

// Types for Citizen Signup
interface SignupFormData {
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
}

interface SignupErrors {
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    general: string;
}

// Type for the overall view state
type View = 'leaderLogin' | 'citizenLogin' | 'citizenSignup';

// Props for the individual view components
interface ViewProps {
    setView: (view: View) => void;
}

// Props for the Custom Message modal
interface CustomMessageProps {
    message: string;
    onClose: () => void;
}

// --- CONFIGURATION ---


// Helper for displaying custom messages (replaces alert())
const CustomMessage: React.FC<CustomMessageProps> = ({ message, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-xl font-bold text-green-600">Taarifa</h3>
            <p className="text-gray-700">{message}</p>
            <button
                onClick={onClose}
                className="w-full py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition"
            >
                Funga
            </button>
        </div>
    </div>
);

// --- 1. LEADER LOGIN COMPONENT ---
const LeaderLogin: React.FC<ViewProps> = ({ setView }) => {
    const [formData, setFormData] = useState<LoginFormData>({
        identifier: '',
        password: ''
    });
    const [errors, setErrors] = useState<LoginErrors>({
        identifier: '',
        password: '',
        general: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    // Validation functions
    const validateIdentifier = (value: string): string => {
        if (!value.trim()) return 'Jina au barua pepe inahitajika';
        if (value.trim().length < 3) return 'Jina au barua pepe ni fupi sana';
        return '';
    };

    const validatePassword = (value: string): string => {
        if (!value) return 'Neno la siri linahitajika';
        if (value.length < 6) return 'Neno la siri ni fupi sana';
        return '';
    };

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name as keyof LoginErrors]: '', general: '' }));
    };

    // Handle blur for real-time validation
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let error = '';

        if (name === 'identifier') {
            error = validateIdentifier(value);
        } else if (name === 'password') {
            error = validatePassword(value);
        }

        setErrors(prev => ({ ...prev, [name as keyof LoginErrors]: error }));
    };

    // Handle form submission
    const handleSubmit = async () => {
        const identifierError = validateIdentifier(formData.identifier);
        const passwordError = validatePassword(formData.password);

        if (identifierError || passwordError) {
            setErrors({ identifier: identifierError, password: passwordError, general: '' });
            return;
        }

        setIsLoading(true);
        setErrors({ identifier: '', password: '', general: '' });

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}api/auth/leader/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrors(prev => ({
                    ...prev,
                    general: data.message || 'Kuna tatizo. Jaribu tena.'
                }));
                return;
            }

            console.log('Leader Login successful:', data);
            localStorage.setItem('leaderToken', data.token);
            localStorage.setItem('leaderId', data.leader.id);
            localStorage.setItem('isLeader', 'true');
            setMessage('Umeingia kwa uongozi!');
            navigate("/home");

        } catch (error) {
            setErrors(prev => ({ ...prev, general: 'Kuna tatizo la mtandao. Jaribu tena.' }));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            {message && <CustomMessage message={message} onClose={() => setMessage('')} />}
            <div className="bg-transparent p-4 sm:p-8">
                {/* Profile Section */}
                <div className="text-center mb-8">
                    <div className="relative inline-block mb-4">
                        <div className="w-32 h-32 rounded-full overflow-hidden mx-auto bg-green-100 flex items-center justify-center">
                            <User className="w-16 h-16 text-green-600" />
                        </div>
                    </div>
                    <h1 className="text-xl font-bold text-gray-800">Karibu Kiongozi</h1>
                    <h2 className="text-md md:text-xl font-semibold text-gray-700 mb-1">
                        Civic Communication Platform
                    </h2>
                    <p className="text-gray-500 italic">"Jukwaa la Uhusiano Bora."</p>
                </div>

                {/* Form Section */}
                <div className="space-y-6">
                    {errors.general && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{errors.general}</p>
                        </div>
                    )}

                    {/* Identifier Field */}
                    <div>
                        <label htmlFor="leaderIdentifier" className="block text-lg font-medium text-gray-700 mb-2">
                            Jina/Barua pepe
                        </label>
                        <input
                            type="text"
                            id="leaderIdentifier"
                            name="identifier"
                            value={formData.identifier}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-4 py-3 bg-green-50 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.identifier
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                : 'border-green-100 focus:border-green-400 focus:ring-green-200'
                                }`}
                            placeholder="Andika jina au barua pepe"
                            disabled={isLoading}
                        />
                        {errors.identifier && (
                            <p className="mt-1 text-sm text-red-600">{errors.identifier}</p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div>
                        <label htmlFor="leaderPassword" className="block text-lg font-medium text-gray-700 mb-2">
                            Neno la siri
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="leaderPassword"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`w-full px-4 py-3 bg-green-50 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.password
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                    : 'border-green-100 focus:border-green-400 focus:ring-green-200'
                                    }`}
                                placeholder="Andika neno la siri"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                disabled={isLoading}
                            >
                                {/* Icons for show/hide password */}
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                                Inasubiri...
                            </span>
                        ) : (
                            'Ingia Kama Kiongozi'
                        )}
                    </button>

                    <div className="text-center mt-4">
                        <button
                            onClick={() => setView('citizenLogin')}
                            className="text-green-600 hover:text-green-700 font-semibold hover:underline mt-4 text-sm"
                        >
                            <span className="flex items-center justify-center gap-1">
                                <LogIn className="w-4 h-4" />
                                Ingia Kama Raia
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- 2. CITIZEN LOGIN COMPONENT ---
const CitizenLogin: React.FC<ViewProps> = ({ setView }) => {
    const [formData, setFormData] = useState<LoginFormData>({
        identifier: '',
        password: ''
    });
    const [errors, setErrors] = useState<LoginErrors>({
        identifier: '',
        password: '',
        general: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    // Validation functions
    const validateIdentifier = (value: string): string => {
        if (!value.trim()) return 'Namba ya simu au barua pepe inahitajika';
        if (value.trim().length < 3) return 'Kitambulisho ni fupi sana';
        return '';
    };

    const validatePassword = (value: string): string => {
        if (!value) return 'Neno la siri linahitajika';
        if (value.length < 6) return 'Neno la siri ni fupi sana';
        return '';
    };

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name as keyof LoginErrors]: '', general: '' }));
    };

    // Handle blur for real-time validation
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let error = '';

        if (name === 'identifier') {
            error = validateIdentifier(value);
        } else if (name === 'password') {
            error = validatePassword(value);
        }

        setErrors(prev => ({ ...prev, [name as keyof LoginErrors]: error }));
    };

    // Handle form submission
    const handleSubmit = async () => {
        const identifierError = validateIdentifier(formData.identifier);
        const passwordError = validatePassword(formData.password);

        if (identifierError || passwordError) {
            setErrors({ identifier: identifierError, password: passwordError, general: '' });
            return;
        }

        setIsLoading(true);
        setErrors({ identifier: '', password: '', general: '' });

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}api/auth/citizen-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrors(prev => ({
                    ...prev,
                    general: data.message || 'Kuna tatizo. Jaribu tena.'
                }));
                return;
            }

            console.log('Citizen Login successful:', data);
            localStorage.setItem('citizenToken', data.token);
            localStorage.setItem('citizenId', data.citizen.id);
            localStorage.setItem('isLeader', 'false');

            navigate('/home');

        } catch (error) {
            setErrors(prev => ({ ...prev, general: 'Kuna tatizo la mtandao. Jaribu tena.' }));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            {message && <CustomMessage message={message} onClose={() => setMessage('')} />}
            <div className="bg-transparent p-4 sm:p-8">
                {/* Profile Section */}
                <div className="text-center mb-8">
                    <div className="relative inline-block mb-4">
                        <div className="w-32 h-32 rounded-full overflow-hidden mx-auto bg-green-100 flex items-center justify-center">
                            <User className="w-16 h-16 text-green-600" />
                        </div>
                    </div>
                    <h1 className="text-xl font-bold text-gray-800">Karibu Raia</h1>
                    <h2 className="text-md md:text-xl font-semibold text-gray-700 mb-1">
                        Civic Communication Platform
                    </h2>
                    <p className="text-gray-500 italic">"Jukwaa la Uhusiano Bora."</p>
                </div>

                {/* Form Section */}
                <div className="space-y-6">
                    {errors.general && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{errors.general}</p>
                        </div>
                    )}

                    {/* Identifier Field */}
                    <div>
                        <label htmlFor="citizenIdentifier" className="block text-lg font-medium text-gray-700 mb-2">
                            Simu/Barua pepe
                        </label>
                        <input
                            type="text"
                            id="citizenIdentifier"
                            name="identifier"
                            value={formData.identifier}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-4 py-3 bg-green-50 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.identifier
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                : 'border-green-100 focus:border-green-400 focus:ring-green-200'
                                }`}
                            placeholder="Andika simu au barua pepe"
                            disabled={isLoading}
                        />
                        {errors.identifier && (
                            <p className="mt-1 text-sm text-red-600">{errors.identifier}</p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div>
                        <label htmlFor="citizenPassword" className="block text-lg font-medium text-gray-700 mb-2">
                            Neno la siri
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="citizenPassword"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`w-full px-4 py-3 bg-green-50 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.password
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                    : 'border-green-100 focus:border-green-400 focus:ring-green-200'
                                    }`}
                                placeholder="Andika neno la siri"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                disabled={isLoading}
                            >
                                {/* Icons for show/hide password */}
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                                Inasubiri...
                            </span>
                        ) : (
                            'Ingia Kama Raia'
                        )}
                    </button>

                    {/* Sign Up Link and Leader Link */}
                    <div className="text-center mt-4 space-y-2">
                        <p className="text-gray-600">
                            Sina Akaunti,{' '}
                            <button
                                onClick={() => setView('citizenSignup')}
                                className="text-green-600 hover:text-green-700 font-semibold hover:underline"
                            >
                                Fungua
                            </button>
                        </p>
                        <button
                            onClick={() => setView('leaderLogin')}
                            className="text-gray-500 hover:text-green-700 font-medium hover:underline text-sm"
                        >
                            <span className="flex items-center justify-center gap-1">
                                <LogIn className="w-4 h-4" />
                                Ingia Kama Kiongozi
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- 3. CITIZEN SIGNUP COMPONENT ---
const CitizenSignup: React.FC<ViewProps> = ({ setView }) => {
    const [formData, setFormData] = useState<SignupFormData>({
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState<SignupErrors>({
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        general: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');

    // Validation functions
    const validateEmail = (value: string): string => {
        if (!value.trim()) return 'Barua pepe inahitajika';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Muundo batili wa barua pepe';
        return '';
    };

    const validatePhone = (value: string): string => {
        if (!value.trim()) return 'Namba ya simu inahitajika';
        if (value.trim().length < 8) return 'Namba ya simu ni fupi sana';
        return '';
    };

    const validatePassword = (value: string): string => {
        if (!value) return 'Neno la siri linahitajika';
        if (value.length < 6) return 'Neno la siri linahitaji angalau herufi 6';
        return '';
    };

    const validateConfirmPassword = (value: string, password: string): string => {
        if (value !== password) return 'Neno la siri halifanani';
        return '';
    };

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name as keyof SignupErrors]: '', general: '' }));
    };

    // Handle blur for real-time validation
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let error = '';

        if (name === 'email') error = validateEmail(value);
        else if (name === 'phone') error = validatePhone(value);
        else if (name === 'password') error = validatePassword(value);
        else if (name === 'confirmPassword') error = validateConfirmPassword(value, formData.password);

        setErrors(prev => ({ ...prev, [name as keyof SignupErrors]: error }));
    };

    // Handle form submission
    const handleSubmit = async () => {
        // Validate all fields
        const emailError = validateEmail(formData.email);
        const phoneError = validatePhone(formData.phone);
        const passwordError = validatePassword(formData.password);
        const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);

        if (emailError || phoneError || passwordError || confirmPasswordError) {
            setErrors({
                email: emailError,
                phone: phoneError,
                password: passwordError,
                confirmPassword: confirmPasswordError,
                general: ''
            });
            return;
        }

        setIsLoading(true);
        setErrors({ email: '', phone: '', password: '', confirmPassword: '', general: '' });

        try {
            // Destructure to omit confirmPassword before sending to API
            const { confirmPassword, ...dataToSend } = formData; 

            const response = await fetch(`${import.meta.env.VITE_API_URL}api/auth/create-citizen`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrors(prev => ({
                    ...prev,
                    general: data.message || 'Kuna tatizo wakati wa kufungua akaunti. Jaribu tena.'
                }));
                return;
            }

            console.log('Citizen Registration successful:', data);
            setMessage('Akaunti yako imefunguliwa! Tafadhali ingia. (Account created successfully! Please log in.)');
            // Reset form data on successful submission
            setFormData({ email: '', phone: '', password: '', confirmPassword: '' });
            setView('citizenLogin'); // Redirect to login on success

        } catch (error) {
            setErrors(prev => ({ ...prev, general: 'Kuna tatizo la mtandao. Jaribu tena.' }));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            {message && <CustomMessage message={message} onClose={() => setMessage('')} />}
            <div className="bg-transparent p-4 sm:p-8">
                {/* Profile Section */}
                <div className="text-center mb-8">
                    <div className="relative inline-block mb-4">
                        <div className="w-32 h-32 rounded-full overflow-hidden mx-auto bg-green-100 flex items-center justify-center">
                            <UserPlus className="w-16 h-16 text-green-600" />
                        </div>
                    </div>
                    <h1 className="text-xl font-bold text-gray-800">Fungua Akaunti</h1>
                    <h2 className="text-md md:text-xl font-semibold text-gray-700 mb-1">
                        Civic Communication Platform
                    </h2>
                    <p className="text-gray-500 italic">"Jiunge na Jukwaa la Uhusiano Bora."</p>
                </div>

                {/* Form Section */}
                <div className="space-y-6">
                    {errors.general && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{errors.general}</p>
                        </div>
                    )}

                    {/* Email Field */}
                    <div>
                        <label htmlFor="signupEmail" className="block text-lg font-medium text-gray-700 mb-2">
                            Barua pepe
                        </label>
                        <input
                            type="email"
                            id="signupEmail"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-4 py-3 bg-green-50 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.email
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                : 'border-green-100 focus:border-green-400 focus:ring-green-200'
                                }`}
                            placeholder="Andika barua pepe"
                            disabled={isLoading}
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                        )}
                    </div>

                    {/* Phone Field */}
                    <div>
                        <label htmlFor="signupPhone" className="block text-lg font-medium text-gray-700 mb-2">
                            Namba ya Simu
                        </label>
                        <input
                            type="tel"
                            id="signupPhone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-4 py-3 bg-green-50 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.phone
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                : 'border-green-100 focus:border-green-400 focus:ring-green-200'
                                }`}
                            placeholder="Andika namba ya simu"
                            disabled={isLoading}
                        />
                        {errors.phone && (
                            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div>
                        <label htmlFor="signupPassword" className="block text-lg font-medium text-gray-700 mb-2">
                            Neno la siri
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="signupPassword"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`w-full px-4 py-3 bg-green-50 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.password
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                    : 'border-green-100 focus:border-green-400 focus:ring-green-200'
                                    }`}
                                placeholder="Andika neno la siri (min. 6)"
                                disabled={isLoading}
                            />
                            {/* Toggle button */}
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                disabled={isLoading}
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                        )}
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-lg font-medium text-gray-700 mb-2">
                            Thibitisha Neno la Siri
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-4 py-3 bg-green-50 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.confirmPassword
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                : 'border-green-100 focus:border-green-400 focus:ring-green-200'
                                }`}
                            placeholder="Rudia neno la siri"
                            disabled={isLoading}
                        />
                        {errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                                Inafungua...
                            </span>
                        ) : (
                            'Fungua Akaunti'
                        )}
                    </button>

                    {/* Login Link */}
                    <div className="text-center mt-4 space-y-2">
                        <p className="text-gray-600">
                            Tayari Nina Akaunti,{' '}
                            <button
                                onClick={() => setView('citizenLogin')}
                                className="text-green-600 hover:text-green-700 font-semibold hover:underline"
                            >
                                Ingia
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- MAIN APP CONTAINER ---
const App: React.FC = () => {
    const [view, setView] = useState<View>('citizenLogin'); // Default to citizen login

    // Use a single image component for all pages to maintain the central image element style
    const renderView = () => {
        switch (view) {
            case 'leaderLogin':
                return <LeaderLogin setView={setView} />;
            case 'citizenLogin':
                return <CitizenLogin setView={setView} />;
            case 'citizenSignup':
                return <CitizenSignup setView={setView} />;
            default:
                return <CitizenLogin setView={setView} />;
        }
    };

    return (
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
            {/* The main container to center the form */}
            {renderView()}
        </div>
    );
};

export default App;