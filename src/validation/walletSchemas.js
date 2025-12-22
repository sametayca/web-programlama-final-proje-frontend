import * as Yup from 'yup'

export const topUpSchema = Yup.object().shape({
  amount: Yup.number()
    .required('Tutar gereklidir')
    .min(50, 'Minimum yükleme tutarı 50 TL')
    .max(10000, 'Maximum yükleme tutarı 10,000 TL')
    .typeError('Geçerli bir tutar giriniz')
})

export default { topUpSchema }

