import Editor from '@monaco-editor/react'
import React, { useCallback, useEffect, useState } from 'react'
import Loading from '@/components/loading/Loading'
import { Modal, Select } from 'antd'
import { languageList, poj_languageList } from './LanguageList'
import { getCurrentUserinfo, updateInfoApi } from '@/api/user'
import CodeEditorConfig from '@/components/editor/CodeEditorConfig'
import { useRecoilState, useRecoilValue } from 'recoil'
import { languageState, monacoOptionsState, monacoThemeState, userInfoState } from '@/store/appStore'
import MySvgIcon from '../Icon/MySvgIcon'
import { cpp } from '@/config/config'

interface Iprops {
  value: string
  className?: string
  height: number
  codeChange: Function
  setCodeLanguage: Function
  oj: string
}

const CodeEditor: React.FC<Iprops> = (props: Iprops) => {
  const { height, value, className, codeChange, setCodeLanguage, oj } = props
  const [languageOptions, setLanguageOptions] = useState(languageList)
  const [openConfigModal, setopenConfigModal] = useState(false)
  const [info, setInfo] = useRecoilState(userInfoState)
  const [monacoOptions, setMonacoOptions] = useRecoilState(monacoOptionsState)
  const [language, setLanguage] = useRecoilState(languageState)
  const monacoTheme = useRecoilValue(monacoThemeState)

  console.log('monacoTheme ==> ', monacoTheme)

  useEffect(() => {
    setLanguageOptions(() => {
      switch (oj) {
        case 'POJ':
          return poj_languageList
        default:
          return languageList
      }
    })
  }, [])

  const handleLanguageChange = (value: any) => {
    console.log(value)
    setCodeLanguage(value)
    setLanguage(value)
    updateConfig(value)
  }

  const updateConfig = (language?: string) => {
    const newInfo = {
      ...info,
      language
    }
    updateInfoApi(JSON.stringify(newInfo)).then(async (res) => {
      if (res.data.code === 200) {
        const res = await getCurrentUserinfo()
        setInfo(res.data.data.user)
      }
    })
  }
  return (
    <>
      <div
        style={{
          height: `${height}px`
        }}
      >
        <div className={'bg-slate-50 h-12 p-2 flex items-center'}>
          <Select
            style={{
              width: '160px'
            }}
            bordered={false}
            defaultValue={language}
            options={languageOptions}
            onChange={handleLanguageChange}
          ></Select>
          <div className='grow'></div>
          <div
            onClick={() => setopenConfigModal(true)}
            className='hover:cursor-pointer'
          >
            <MySvgIcon
              href='#icon-setting'
              size={2}
            ></MySvgIcon>
          </div>
        </div>
        <Editor
          defaultValue={value}
          height={`${height - 42}px`}
          width='100%'
          className={`${className} bg-white`}
          language={cpp.includes(language) ? 'cpp' : language}
          theme={monacoTheme}
          loading={<Loading></Loading>}
          onChange={(value) => codeChange(value)}
          options={monacoOptions}
        />
      </div>
      <Modal
        title={<p>代码编辑器配置</p>}
        open={openConfigModal}
        onCancel={() => setopenConfigModal(false)}
        afterClose={updateConfig}
        footer={[]}
        centered
      >
        <CodeEditorConfig
          monacoOptions={monacoOptions}
          setMonacoOptions={setMonacoOptions}
        ></CodeEditorConfig>
      </Modal>
    </>
  )
}

export default CodeEditor
