import React from 'react'
import {Icon} from "antd"

import styles from './TourTip.less'
import book from "./img/book.png"
import mac from "./img/mac.png"
import magnifier from "./img/magnifier.png"
class TourTip extends React.Component {
    constructor() {
      super()
      this.state = {}
    }
    render(){
        return <div className={styles.TourTip}>
            <div className={styles.TourTip_Content}>
                <section className={styles.title}>
                    <p>欢迎来到蓦</p>
                </section>
                <section className={styles.subhead}>
                    <p>强大的AI应用开发工具与友好的交流平台</p>
                </section>
                <ul>
                    <li>
                        <ol></ol>
                        <div><img src={book}/></div>
                        <p>寻找需求</p>
                        <article>
                        其他用户提出的需求会在这里分类展示，你可以寻找自己擅长的领域进行回答。如果你有任何需求，点击<span>“发布需求”</span>也会找到合适的帮手来为你解决。
                        </article>
                    </li>
                    <li>
                        <ol style={{borderTop:'2px solid #34C0E2'}}></ol>
                        <div><img src={book}/></div>
                        <p>探索发现</p>
                        <article>
                        探索学习公开的应用以及模块算法，还有开放的数据集，发现喜欢的项目可以点赞收藏，如果你有优质的资源我们也欢迎你与其他数据爱好者共享.
                        </article>
                    </li>
                    <li>
                        <ol></ol>
                        <div><img src={book}/></div>
                        <p>开发实验</p>
                        <article>
                        无论完整的 AI 应用或是封装好的算法模块，都可以跳过繁琐的开发环境搭建，使用我们内嵌的 JupyterLab 直接上手。点击<span>“新建应用”</span>或<span>“新建模块”</span>快速开始。
                        </article>
                    </li>
                </ul>
                <section className={styles.help}>
                    <button>帮助文档</button>
                </section>
            </div>
            <section className={styles.close}>
                <Icon type="close" style={{marginRight:10}}/>
                关闭
            </section>
        </div>
    }
}
export default TourTip