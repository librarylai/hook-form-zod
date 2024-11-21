# 【筆記】React-hook-form 搭配 Zod 表單驗證

###### tags: `筆記文章`

![image](https://hackmd.io/_uploads/rk329fOzye.png)

以前曾經分別寫過 [【筆記】React Formik 表單套件](https://hackmd.io/@Librarylai/ByYQIBxEq) 與 [【筆記】Yup 表單驗證套件](https://hackmd.io/@Librarylai/S1AmFitEc) 這兩篇來實作表單驗證功能，最近這兩年內社群上漸漸的變成是用 react-hook-form 搭配 Zod 來實作。

> 簡單玩了一下，確實 **react-hook-form** 在設定上面比起 Formik 來說簡化了許多，透過一個 `useForm` Hook 就可以直接打天下了。而 **Zod** 在設定上面與 **Yup** 差不多，但在文件閱讀性上面比起 **Yup** 簡單了超多，但 **Yup** 所提供的函示目前初步看起來是比 Zod 多的，可以想像是 Zod 是精簡版的 Yup。

其實 react-hook-form 自己就有提供 validation 的方法，為了比較搭配 Zod 好用還是單純用 react-hook-form 就好，因此等等會各別實作驗證方式來比較其中的差異。

## 使用 react-hook-form validation

```jsx=
/* HookForm.tsx */
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form'
import './App.css'
type Inputs = {
  email: string
  password: string
  confirmPassword: string
  checkFields: {
    name: string
  }[]
}

function HookForm() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Inputs>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'checkFields', // 綁定到 checkFields
  })
  const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data)

  console.log('errors', { errors })

  return (
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
                {...register(`checkFields.${index}.name`, { required: `欄位必填` })} // 動態註冊
              />
              <button type='button' onClick={() => remove(index)}>
                刪除
              </button>
            </div>
            <div className='error-text '>{errors?.checkFields?.[index] && <span>{errors?.checkFields?.[index]?.name?.message}</span>}</div>
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
  )
}

export default HookForm

```

使用 react-hook-form 最基本的方法就是直接使用 `useForm` ，主要會使用它回傳的 `register`、`handleSubmit`、`formState` 這幾個參數。以下先簡單介紹一下

### `register: (name: string, RegisterOptions?) => ({ onChange, onBlur, name, ref })`

> This method allows you to register an input or select element and apply validation rules to React Hook Form. Validation rules are all based on the HTML standard and also allow for custom validation methods.

By invoking the register function and supplying an input's name, you will receive the following methods:
`register` 就是將我們常要傳給 input 的參數透過內部 fn 處理後封裝起來一次讓我們注入到 input 中，因此我們只需要 `...register('name')` 就可以將 `onChange, onBlur, name, ref` 一次塞入，不必再寫一些如何將「值」塞到 react-hook-from 中的設定。

**`register` 有個最主要的 Options 參數，也就是我們用來設定欄位驗證的地方。** 在第二個參數中透過 `{}` 的形式來設定，而 `message` 參數就是當「**驗證錯誤時的 Error Message**」，使用方法如下圖：

![image](https://hackmd.io/_uploads/BkiESuuGke.png)

### `handleSubmit: ((data: Object, e?: Event) => Promise<void>, (errors: Object, e?: Event) => Promise<void>) => Promise<void>`

> This function will receive the form data if form validation is successful.

`handleSubmit` 不外乎就是呼叫驗證檢查，當檢查成功時才會執行「第一個參數所傳入的 fn 」

```jsx=
// onSubmit 才是我們最終要執行的 fn
/*  ex. */
handleSubmit(onSubmit)()
```

### `formState: Object`

> This object contains information about the entire form state. It helps you to keep on track with the user's interaction with your form application.

`formState` 是整個 form 表單的資訊，比較常用的像是 `isDirty`、`isValid`、`isLoading`、`errors`，**這邊我們需要在驗證錯誤時印出 Error Message，因此就會需要 `errors` 這個參數。**

```jsx=
/*  ex. */
<div className='error-text '>{errors.password && <span>{errors.password.message}</span>}</div>

```

### useFieldArray

> Custom hook for working with Field Arrays (dynamic form). The motivation is to provide better user experience and performance. You can watch this short video to visualize the performance enhancement.

在上面的程式碼範例中，可以看到我們也模擬了「動態新增、刪除表單欄位」的情境，也就是資料結構為 Array object 的情況，這些情況不外乎就是「新增(append)、刪除(remove)、插入(insert)、移動(move)」這幾種，`react-hook-form` 也很貼心的將這些函示封裝到 `useFieldArray` 中讓我們方便對 Form 表單內的欄位進行操作。

> ps. 使用 `useFieldArray` 就不用自己在手刻新增、刪除...這些函示了~~~萬歲 :heart_eyes: 🙌

```jsx=
/* ex. */
  const { control, register } = useForm();
  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
    control, // 代表要控制哪個 useForm 表單
    name: "checkFields", // 對應到表單中的 哪個欄位
  });

// 新增按鈕
<button
  type='button'
    // 新增一筆到 checkFields 中，並且預設結構為 {name: ''}
  onClick={() => append({ name: '' })}
>
  新增欄位
</button>
```

## 使用 schema validation Zod

```jsx=
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import './App.css'
import { z } from 'zod'
const schema = z
  .object({
    email: z.string().min(1, { message: 'zod 必填欄位' }),
    password: z.string({}).min(6, { message: 'zod 長度至少6碼' }),
    confirmPassword: z.string(),
    checkFields: z
      .array(
        z.object({
          id: z.number(),
          name: z.string().min(1, { message: 'zod 檢查欄位內每項必填' }),
        })
      )
      .nullable(),
  })
  .refine((data) => data.password !== data.confirmPassword, {
    message: 'zod 密碼不一致',
    path: ['confirmPassword'],
  })

// schema 轉 TS
type Inputs = z.infer<typeof schema>

function ZodForm() {
  const {
    register,
    handleSubmit,
    watch,
    trigger,
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
                    /* trigger 這邊因為是每當 onChange 就即時驗證，因此當刪除時因為是 index 關係，後面的項目吃到前面的 index
                      例如 checkFields 有三筆資料都驗證錯誤，當第二筆(index:1) 填寫資料後刪除，會導致第三筆(index:2) 驗證錯誤資訊不見( 因為 index:1 現在是正確的 )
                      因此需要重新觸發驗證
                    */
                    trigger('checkFields')
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

```

在開始講解程式碼之前，一樣先簡單介紹一下 **Zod** 這套 Library。

> Zod is a TypeScript-first schema declaration and validation library. I'm using the term "schema" to broadly refer to any data type, from a simple string to a complex nested object.

**Zod 簡單來說就是一套 TypeScript 友好的驗證套件**，我們只需要定義好 Schema 就能「產生出型別」與「應用在驗證」上面，減少還需要自己定義 TypeScript 以及未來更動時還要同部調整的麻煩。只需要修改 Schema 就可以一併處理。

### 如何搭配 react-hook-form

首先需要將 `zod` 與 `@hookform/resolvers` 套件加入到專案中並且引入 `z` 與 `zodResolver`。

> `npm i zod @hookform/resolvers`

```tsx=
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
```

接著將 `react-hook-form` 的 `useForm` 增加 `resolver` 參數並且將 `zodResolver(schema)` 放入即可。

```tsx=
 // 使用 z 來定義 schema
 const schema = z.object({
     name: z.string()
 })
 const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),  // 這段～～～
  })
```

### Basic Type 使用

Zod 也封裝許多常見的驗證函式，例如：長度(`min`,`max`,`length`)、時間(`date`,`time`)、格式(`email`,`url`,`regix`)...等。

> 開發中最常用來驗證的基礎型別就是 Number 與 String，這邊直接截圖這兩個類型的函式：
>
> #### String 類型函式
>
> ![image](https://hackmd.io/_uploads/SyYVPsFMyl.png)
>
> #### Number 類型函式
>
> ![image](https://hackmd.io/_uploads/HJaKwoFMyx.png)

可以看到上面的程式碼中，像是 Email、Password 這種文字輸入框就可以用 String 型別來做驗證，例如：

```js=
const passwordSchema = z.string().min(6, { message: '長度至少6碼' })
const emailSchema = z.string().email({ message: 'email 不符' })
console.log(passwordSchema.safeParse('1234')) // {success: false, error: .... } 可用 result.error.format() 轉換為 object

console.log(emailSchema.safeParse('lib')) // throw Error

```

> 補充： `parse` 與 `safeParse` 的差別：
>
> - 使用 `parse` 時，當驗證錯誤時會直接 throw Error 因此需要用 try/catch 來包住，以免值接白屏。
>
> - 使用 `safeParse` 時，當驗證錯誤時會回傳 `{success: 'false', error: {.....}}` 的結構，不過 error 需要用 `format()` 轉換成物件形式。

### Reference Types 使用

**Zod** 最方便的操作地方其實在於 `Array`、`Object` 上的操作，還記得上面使用 `react-hook-form` 時，我們要處理「動態新增欄位」需要透過 `useFieldArray` 提供的函式來新增刪減，但這對「既有的程式」或是「單純用 js 寫的程式」都不是特別方便，會需要改寫原本的寫法來符合 `useFieldArray` 的方式。

> **補充： 這邊有一個重要的需要注意**
> 當我們不是用 `useFieldArray` 而是自己使用 map 來處理時，因為會使用 `index` 來做 `register`
>
> ` <input {...register(`checkFields.${index}.name`)}/> // 動態註冊`
>
> 因此當刪除時會需要再 `trigger` **不然會使後面項目吃到前面的驗證狀態**

然而使用 Zod 則只需要很直覺的定義好 Array object 結構就可以了，像是上面範例的 `checkFields` 設定一樣。

> **簡單說明一下 `checkFields` 驗證設定代表的意思：**
>
> `checkFields` 要是一個 Array 類型或是 null，如果是 Array 則裡面要有一個 Object 型態並且包含了 `id` 與 `name` 兩個欄位：
>
> - id 要是 Number 型態
> - name 要是字串型態，且必填

```typescript=
const schema = z
  .object({
    email: z.string().min(1, { message: '必填欄位' }),
    password: z.string({}).min(6, { message: '長度至少6碼' }),
    confirmPassword: z.string(),
    checkFields: z
      .array( // 是一個 Array
        z.object({ // 裡面每個 Object 有： id, name 欄位
          id: z.number(), // id 要是 Number 型態
            // name 要是字串型態，且必填
          name: z.string().min(1, { message: '檢查欄位內每項必填' }),
        })
      )
      .nullable() // 或是 Null,
  })
```

### 欄位需要互相比較

很多時候在驗證時我們需要與其他輸入欄位比較，像是範例的 `password` 與 `confrimPassword` 就是一個典型的例子，`confrimPassword` 需要去驗證是否輸入的內容與 `password` 一致，這時就需要用到 **`refine()`** 這個函式的幫忙了，我們直接看範例。

```tsx=
const schema = z
  .object({
    password: z.string(),
    confirmPassword: z.string(),
    ...審略...
  })
  .refine((data) => data.password !== data.confirmPassword, {
    message: 'Zod 密碼不一致',
    path: ['confirmPassword'], // 指定錯誤是在哪個欄位上
  })
```

### Schema 轉 Typescript Type

最後當我們定義好 Schema 後，再來就可以透過 `z.infer<typeof schema>` 將 Schema 無痛轉換成 Type 拿給 `useForm` 來使用了，

```typescript=
type Inputs = z.infer<typeof schema>

function ZodForm() {
  const { ...審略...  } = useForm<Inputs>({...審略...})
 }
```

## Demo

![IA3VT71-Imgur-ezgif.com-video-to-gif-converter (5)](https://hackmd.io/_uploads/Hy_xbM5Gkl.gif)

## Conclusion

兩者各別實作下來，可以注意到`react-hook-form` 是將驗證機制寫在註冊(register) 到 DOM 元件上的時候，因此每個欄位的驗證會散落在每個 input 區塊中，而 `Zod` 是將所有欄位的驗證設定寫在一起，一併設定到 `useForm resolver` 上面，兩者的寫法有好有壞還是要看團隊普遍喜歡哪種攥寫方式。

不可否認的是 `Zod` 在表單複雜的情境下會比 `react-hook-form` 來的簡潔與方便，更何況是有用 TypeScript 的專案下會更加便利。（_因為不用再額外定義 Type 了_），因此如果有使用 `react-hook-form` 的話我個人是會推薦順便導入 Zod 這套好用的驗證套件。

#### 以上就是本篇『React-hook-form 搭配 Zod 表單驗證』的全部內容，之後有空會再看看裡面還有哪些好用的 Hook 或是 Function，到時再來補充給大家，如有任何錯誤的地方也再麻煩告知，謝謝您的觀看。

#### Github：https://github.com/librarylai/hook-form-zod

## Reference

1. [Zod.dev](https://zod.dev/?id=introduction)
2. [加強你的 TypeScript 驗證：Type Guard？或許該試試 Zod](https://medium.com/ikala-tech/enhance-typescript-validation-by-zod-8f52837a58a1)
3. [營養師不開菜單的第十六天 - TypeScript 不夠？使用 Zod 做型別驗證](https://ithelp.ithome.com.tw/articles/10331458)
