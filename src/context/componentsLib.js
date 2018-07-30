import React from 'react'
import AxiosUtil from '../util/axios'
import ToolsUtil from '../util/tools'

export const Lib = React.createContext()

export class LibProvider extends React.Component {
  constructor (props) {
    super(props)
    // 初始化拉数据（根据类型）
    this.updateLib = async (type) => {
      let res = await AxiosUtil.get(`/getListData?type=${type}`)
      switch (type) {
        case 'vnode':
          this.vnodeFilter(res)
          break
        case 'class':
          let {show, lib} = res
          this.setState({
            classLibrary: lib,
            classShow: show
          })
          break
      }
      return res
    }

    // 保存样式，保存节点
    this.postLib = async (data, type) => {
      let name
      if (type === 'vnode') {
        name = data.pathName
        let afterUpdateList = await AxiosUtil.post(`write`, {name, type, data})
        this.vnodeFilter(afterUpdateList)
        // 更新com会重新更新样式。所以从新拉取样式

      } else {
        // class
        name = data.name
        let afterUpdateList = await AxiosUtil.post(`write`, {name, type, data})
        // this.setState({
        //   classLibrary: afterUpdateList
        // })
      }
      this.updateLib('class')
    }

    // 根据vnode导出静态css
    this.exportCss = async () => {
      await AxiosUtil.get(`exportCss`)
    }

    // 导出页面
    this.postPage = async (data) => {
      let result = await AxiosUtil.post(`savePage`, {json: data})
      alert ('post ' + result)
      return result
    }

    // 从file中导出json
    this.getFileTransJson = async (path) => {
      let result = await AxiosUtil.get(`/xmlToNode?path=${path}`)
      return result
    }

    this.getLib = (name, type) => {
      switch (type) {
        case 'vnode':
          // 判断
          if (name.includes('page')) {
            return this.beforeAddNode(this.state.pageLibrary[name])
          } else {
            return this.beforeAddNode(this.state.vnodeLibrary[name])
          }
          break
        case 'class':
          return ToolsUtil.getClone(this.state.classLibrary[name])
          break
      }
    }

    // 当前正在编辑的样式
    this.changeCopyClass = (copyClass) => {
      this.setState({
        copyClass: copyClass
      })
    }

    this.state = {
      classLibrary: {}, // 课程列表
      classShow: {}, // 展示
      vnodeLibrary: undefined, // 课程列表
      pageLibrary: {}, // 课程列表
      copyClass: {},
      getLib: this.getLib, // 获取
      updateLib: this.updateLib, // 更新
      postLib: this.postLib, // 更新
      getFileTransJson: this.getFileTransJson, //
      changeCopyClass: this.changeCopyClass, // 更新
      postPage: this.postPage, // 更新
      exportCss: this.exportCss // 更新
    }
    this.vnodeFilter = this.vnodeFilter.bind(this)
  }
  // 内部使用的。
  /**
   * 为原始数据，增加上课程状态。
   * over 结束
   * finish 已完成
   * doing 正在做
   * @param originCourseList
   * @returns {*}
   */

  vnodeFilter (res) {
    // 1筛选。
    let pageObj = {}
    let componentsObj = {}
    Object.keys(res).forEach((name) => {
      if (name.includes('page')) {
        pageObj[name] = res[name]
      } else {
        componentsObj[name] = res[name]
      }
    })
    // 2 分类保存
    this.setState({
      vnodeLibrary: componentsObj,
      pageLibrary: pageObj
    })
  }

  beforeAddNode (node) {
    let nodeShadow = ToolsUtil.getClone(node)
    this.vNodeToDom(nodeShadow)
    return nodeShadow
  }

  // 引入前需要重新
  vNodeToDom (node) {
    // 根据json。设置出来最单纯的block。
    node.index = ToolsUtil.uuid(8, 16)
    if (node.children && node.children.length > 0) {
      node.children.forEach((node) => {
        return this.vNodeToDom(node)
      })
    }
  }

  render () {
    return (
      <Lib.Provider value={this.state}>
        {this.props.children}
      </Lib.Provider>
    )
  }
}
