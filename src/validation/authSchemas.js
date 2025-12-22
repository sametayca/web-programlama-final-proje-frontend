import * as Yup from 'yup'

export const registerSchema = Yup.object({
  email: Yup.string()
    .email('Geçerli bir e-posta adresi girin')
    .required('E-posta zorunludur'),
  password: Yup.string()
    .min(8, 'Şifre en az 8 karakter olmalıdır')
    .matches(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir')
    .matches(/[0-9]/, 'Şifre en az bir rakam içermelidir')
    .required('Şifre zorunludur'),
  firstName: Yup.string()
    .min(2, 'Ad en az 2 karakter olmalıdır')
    .required('Ad zorunludur'),
  lastName: Yup.string()
    .min(2, 'Soyad en az 2 karakter olmalıdır')
    .required('Soyad zorunludur'),
  phone: Yup.string()
    .matches(/^(\+90|0)?[0-9]{10}$/, 'Geçerli bir telefon numarası girin')
    .nullable(),
  role: Yup.string()
    .oneOf(['student', 'faculty', 'admin', 'staff'], 'Geçerli bir rol seçin')
    .required('Rol zorunludur'),
  departmentId: Yup.string()
    .when('role', {
      is: (val) => val === 'student' || val === 'faculty',
      then: (schema) => schema.required('Bölüm seçimi zorunludur'),
      otherwise: (schema) => schema.nullable()
    }),
  enrollmentYear: Yup.number()
    .when('role', {
      is: 'student',
      then: (schema) => schema
        .min(2020, 'Geçerli bir yıl girin')
        .max(new Date().getFullYear(), 'Gelecek yıl seçilemez')
        .required('Kayıt yılı zorunludur'),
      otherwise: (schema) => schema.nullable()
    }),
  title: Yup.string()
    .when('role', {
      is: 'faculty',
      then: (schema) => schema
        .oneOf(['professor', 'associate_professor', 'assistant_professor', 'lecturer', 'research_assistant'])
        .nullable(),
      otherwise: (schema) => schema.nullable()
    })
})

export const loginSchema = Yup.object({
  email: Yup.string()
    .email('Geçerli bir e-posta adresi girin')
    .required('E-posta zorunludur'),
  password: Yup.string()
    .required('Şifre zorunludur')
})

export const forgotPasswordSchema = Yup.object({
  email: Yup.string()
    .email('Geçerli bir e-posta adresi girin')
    .required('E-posta zorunludur')
})

export const resetPasswordSchema = Yup.object({
  password: Yup.string()
    .min(8, 'Şifre en az 8 karakter olmalıdır')
    .matches(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir')
    .matches(/[0-9]/, 'Şifre en az bir rakam içermelidir')
    .required('Şifre zorunludur'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Şifreler eşleşmiyor')
    .required('Şifre tekrarı zorunludur')
})

export const profileUpdateSchema = Yup.object({
  firstName: Yup.string()
    .min(2, 'Ad en az 2 karakter olmalıdır')
    .required('Ad zorunludur'),
  lastName: Yup.string()
    .min(2, 'Soyad en az 2 karakter olmalıdır')
    .required('Soyad zorunludur'),
  phone: Yup.string()
    .matches(/^(\+90|0)?[0-9]{10}$/, 'Geçerli bir telefon numarası girin')
    .nullable()
})



