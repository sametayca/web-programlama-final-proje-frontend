import * as Yup from 'yup'

export const topUpSchema = Yup.object().shape({
  amount: Yup.number()
    .required('Tutar gereklidir')
    .min(0.01, 'Tutar 0\'dan büyük olmalıdır')
    .typeError('Geçerli bir tutar giriniz')
})

export default { topUpSchema }

