import { useState } from 'react'
import './App.css'
import ZodForm from './ZodForm'
import HookForm from './HookForm'

function App() {
  // mode 用來比較 hook-form  與 zod
  const [mode, setMode] = useState('hookForm') // hookForm | zod

  return (
    <div>
      <div style={{ margin: '24px' }}>
        <button onClick={() => setMode(mode === 'zod' ? 'hookForm' : 'zod')}>{`切換模式 ${
          mode === 'zod' ? '此為 hook-form + zod' : '此為 hook-form'
        }`}</button>
      </div>
      {mode === 'zod' ? <ZodForm /> : <HookForm />}
    </div>
  )
}

export default App
