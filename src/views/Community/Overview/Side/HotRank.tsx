import { currentArticleState } from '@/store/appStore'
import { getArticleApi, getArticleHotRankApi } from '@/api/article'
import { IArticle } from '@/type'
import { Skeleton, Space, Card } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSetRecoilState } from 'recoil'
import useNavTo from '@/tool/myHooks/useNavTo'

interface IArticleRank {
  Member: string
  Score: number
  article: IArticle
}

const HotRank: React.FC = () => {
  const [articleRank, setarticleRank] = useState<IArticleRank[]>()
  // const setcurrentArticle = useSetRecoilState(currentArticleState)
  const nav = useNavTo()

  useEffect(() => {
    getArticleHotRankApi(1, 10).then(async (res) => {
      console.log(res.data)
      const articles: IArticleRank[] = res.data.data.articles
      let index = 0
      for (let article of articles) {
        const { data } = await getArticleApi(article.Member)
        articles[index].article = data.data.article
        index++
      }
      setarticleRank(articles)
    })
  }, [])

  const handleClick = (index: number) => articleRank && nav(`/community/article/${articleRank[index].Member}`)

  return (
    <Space
      direction='vertical'
      className='w-full'
    >
      {!articleRank && (
        <Skeleton
          active
          paragraph={{ rows: 9 }}
          className='px-4'
        ></Skeleton>
      )}
      {articleRank &&
        articleRank?.map((article, index) => (
          <Card
            size='small'
            hoverable
            key={article.Member}
            onClick={() => {
              handleClick(index)
            }}
            bordered={false}
            bodyStyle={{ padding: '0px' }}
          >
            <div className='flex items-center w-full p-1'>
              <span className='w-8 text-center'>
                {/* {index <= 2 && (
                  <svg className='icon'>
                    <use href={index === 0 ? '#icon-top-one' : index === 1 ? '#icon-top-two' : index === 2 ? '#icon-top-three' : ''}></use>
                  </svg>
                )} */}
                {/* {index > 2 && ( */}
                <span className='w-8 flex justify-center'>
                  <div className='w-4 h-4 text-xs bg-slate-100 rounded-full'>{index + 1}</div>
                </span>
                {/* )} */}
              </span>
              <span
                className='w-36 mx-2 text-xs'
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {article.article.title}
              </span>
              <span className='w-12 flex items-center justify-center'>
                <span>
                  <svg className='icon-small'>
                    <use href='#icon-fire'></use>
                  </svg>
                </span>
                <span className='text-right text-xs'>{article.Score}</span>
              </span>
            </div>
          </Card>
        ))}
    </Space>
  )
}

export default HotRank
