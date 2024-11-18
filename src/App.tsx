import { useState } from 'react'
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form'
import './App.css'
import ZodForm from './ZodForm'
type Inputs = {
  email: string
  password: string
  confirmPassword: string
  checkFields: {
    name: string
  }[]
}

function App() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Inputs>()
  // mode 用來比較 hook-form  與 zod
  const [mode, setMode] = useState('hookForm') // hookForm | zod
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'checkFields', // 綁定到 checkFields
  })
  const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data)

  console.log('errors', { errors })

  return (
    <div>
      <div style={{ margin: '24px' }}>
        <button onClick={() => setMode(mode === 'zod' ? 'hookForm' : 'zod')}>{`切換模式 ${
          mode === 'zod' ? '此為 hook-form + zod' : '此為 hook-form'
        }`}</button>
      </div>
      {mode === 'zod' ? (
        <ZodForm />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='mb16'>
            <h3>Email</h3>
            <input {...register('email', { required: '必填' })} />
            <div className='error-text '>{errors.email && <span>{errors.email.message}</span>}</div>
          </div>
          <div className='mb16'>
            <h3>密碼</h3>
            <input
              type='password'
              {...register('password', {
                required: '必填',
                min: {
                  value: 6,
                  message: '最小至少6碼',
                },
              })}
            />
            <div className='error-text '>{errors.password && <span>{errors.password.message}</span>}</div>
          </div>
          <div className='mb16'>
            <h3>確認密碼</h3>
            <input
              type='password'
              {...register('confirmPassword', {
                validate: (value, formValues) => {
                  return (value !== formValues.password && !value) || '密碼不一致'
                },
              })}
            />
            <div className='error-text '>{errors.confirmPassword && <span>{errors.confirmPassword.message}</span>}</div>
          </div>

          <ul className='mb16 check-wrapper'>
            <h3>檢查裡面每個欄位都需要填寫</h3>
            {fields.map((field, index) => (
              <div key={field.id}>
                <h4>{`欄位${index + 1}`}</h4>
                <div className='mb8'>
                  <input
                    {...register(`checkFields.${index}.name`, { required: `${index + 1}號欄位必填` })} // 動態註冊
                  />
                  <button type='button' onClick={() => remove(index)}>
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
              onClick={() => append({ name: '' })} // 新增一個空欄位
            >
              新增欄位
            </button>
          </ul>

          <div className='mb16'>
            <input type='submit' />
          </div>
        </form>
      )}
    </div>
  )
}

export default App
