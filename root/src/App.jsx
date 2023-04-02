import React from 'react'

import axios from 'axios'

function App() {


  const [data, setData] = React.useState([])

  const [link, setLink] = React.useState('')

  const [error, setError] = React.useState(false)

  const links = data.map((link, index) => {
    return (
      <div className={`border border-green-300 h-[40px] mt-[12px] mx-[60px] rounded flex flex-row`}>
        <p className='w-[200px] my-auto ml-[12px] overflow-hidden text-ellipsis whitespace-nowrap'>{link.link}</p>
        <a href={`https://ut3.su/${link.id}`} className='text-blue-500 my-auto ml-auto mr-[12px]'>{`ut3.su/${link.id}`}</a>
        <button className={`${link.copied?'text-green-500':'text-blue-500'} my-auto mr-[12px]`} onClick={() => {
          navigator.clipboard.writeText(`https://ut3.su/${link.id}`)
          setData(oldData => {
            let newData = oldData
            newData[index].copied = true
            return [
              ...newData
            ]
          })
        }}>{link.copied?'Copied!':'Copy'}</button>
      </div>
    )
  })

  return (
    <div className="flex bg-neutral-100 h-screen">
      <div className='w-[660px] mx-auto'>
        <p className='text-center text-6xl font-bold my-[30px]'>ut3.su</p>
        <div className='w-full bg-white rounded flex flex-col'>
          <p className='text-xl text-center my-[20px]'>URL Shortener</p>

          {
            error ? <p className='text-red-500 ml-[60px] mb-[12px]'>Error, please try again.</p> : null
          }

          <div className='flex w-full px-[60px] h-[40px]'>
            <input type="text" className='border rounded border-neutral-300 py-[8px] pl-[12px] text-md w-3/4 mr-[12px]' value={link} placeholder='Enter link here' onChange={() => {
              setLink(event.target.value)
            }} />
            <button className='bg-blue-500 w-1/4 rounded text-white' onClick={() => {
              turnstile.render('#captcha', {
                sitekey: '0x4AAAAAAACtqe94jhrQRf3G',
                theme: 'light',
                callback: function(token) {
                  axios.get(`https://ut3.su/api/create?link=${link}&t=${token}`).then((response) => {
                    setData(oldData => {
                      let newData = oldData
                      newData.push({ link: link, id: response.data.data, copied: false })
                      return [
                        ...newData
                      ]
                    })

                  }).catch((error) => {
                    setError(true)
                  })
                },
              });
            }}>Shorten URL</button>
          </div>
          {links}
          <div id='captcha' class="cf-turnstile" className='hidden ml-[58px] mt-[12px]' data-sitekey="0x4AAAAAAACtqe94jhrQRf3G" data-callback="javascriptCallback"></div>
          <p className='text-neutral-500 text-center mt-[16px] mb-[20px]'>A tool to shorten a long link</p>
        </div>
      </div>
    </div>
  )
}

export default App
