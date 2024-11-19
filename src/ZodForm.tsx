import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import './App.css'
import { z } from 'zod'
const schema = z
  .object({
    email: z.string().min(1, { message: 'Zod 必填欄位' }),
    password: z.string({}).min(6, { message: 'Zod 長度至少6碼' }),
    confirmPassword: z.string(),
    checkFields: z
      .array(
        z.object({
          id: z.number(),
          name: z.string().min(1, { message: 'Zod 檢查欄位內每項必填' }),
        })
      )
      .nullable(),
  })
  .refine((data) => data.password !== data.confirmPassword, {
    message: 'Zod 密碼不一致',
    path: ['confirmPassword'],
  })

// schema 轉 TS
type Inputs = z.infer<typeof schema>

function ZodForm() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      checkFields: [],
    },
  })
  const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data)
  const checkFields = watch('checkFields')

  console.log('errors', { errors })
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className='mb16'>
        <h3>Email</h3>
        <input {...register('email')} />
        <div className='error-text '>{errors.email && <span>{errors.email.message}</span>}</div>
      </div>
      <div className='mb16'>
        <h3>密碼</h3>
        <input type='password' {...register('password')} />
        <div className='error-text '>{errors.password && <span>{errors.password.message}</span>}</div>
      </div>
      <div className='mb16'>
        <h3>確認密碼</h3>
        <input type='password' {...register('confirmPassword')} />
        <div className='error-text '>{errors.confirmPassword && <span>{errors.confirmPassword.message}</span>}</div>
      </div>

      <ul className='mb16 check-wrapper'>
        <h3>檢查裡面每個欄位都需要填寫</h3>
        {checkFields &&
          checkFields?.map((field, index) => (
            <div key={field?.id}>
              <h4>{`欄位${index + 1}`}</h4>
              <div className='mb8'>
                <input
                  {...register(`checkFields.${index}.name`)} // 動態註冊
                />
                <button
                  type='button'
                  onClick={() => {
                    if (!checkFields) return
                    const newCheckFields = checkFields.filter((item) => item?.id !== field?.id)
                    setValue('checkFields', newCheckFields)
                  }}
                >
                  刪除
                </button>
              </div>
              <div className='error-text '>
                {errors?.checkFields?.[index] && <span>{errors?.checkFields?.[index]?.name?.message}</span>}
              </div>
            </div>
          ))}
        <button
          type='button'
          onClick={() => {
            const newCheckFields = [
              ...(checkFields || []),
              {
                id: new Date().getTime(),
                name: '',
              },
            ]
            setValue('checkFields', newCheckFields)
          }} // 新增一個空欄位
        >
          新增欄位
        </button>
      </ul>

      <div className='mb16'>
        <input type='submit' />
      </div>
    </form>
  )
}

export default ZodForm
