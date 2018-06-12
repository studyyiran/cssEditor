import { Tree } from 'antd';
import React from 'react'
const TreeNode = Tree.TreeNode;

export default class NodeToTree extends React.Component {
  constructor (props) {
    super(props)
    this.onDrop = this.onDrop.bind(this)
    this.onSelect = this.onSelect.bind(this)
  }
  onDragEnter = (info) => {
    // expandedKeys 需要受控时设置
    // this.setState({
    //   expandedKeys: info.expandedKeys,
    // });
  }
  onDrop = (info) => {
    const dropKey = info.node.props.eventKey;
    if (info.node.props.nodeType === 'node-text') {
      return
    }
    const dragKey = info.dragNode.props.eventKey;
    const dropPos = info.node.props.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
    // const dragNodesKeys = info.dragNodesKeys;
    const loop = (data, key, callback) => {
      data.forEach((item, index, arr) => {
        if (item.index === key) {
          return callback(item, index, arr);
        }
        if (item.children) {
          return loop(item.children, key, callback);
        }
      });
    };
    let data = [JSON.parse(JSON.stringify(this.props.node))];
    let dragObj;
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    });
    if (info.dropToGap) {
      let ar;
      let i;
      loop(data, dropKey, (item, index, arr) => {
        ar = arr;
        i = index;
      });
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj);
      } else {
        ar.splice(i + 1, 0, dragObj);
      }
    } else {
      loop(data, dropKey, (item) => {
        item.children = item.children || [];
        // where to insert 示例添加到尾部，可以是随意位置
        item.children.push(dragObj);
      });
    }
    this.props.updateNode(data[0])
  }

  vNodeToDom (node) {
    // 根据json。设置出来最单纯的block。
    let {children} = node
    let {nodeType, text} = node
    if (nodeType === 'node-text') {
      return <TreeNode title={text} nodeType={node.nodeType} key={node.index} />
    } else if (children && children.length > 0) {
      let cArr = children.map((node) => {
        return this.vNodeToDom(node)
      })
      return <TreeNode onMouseEnter={this.whenHover} title={node.nodeType} nodeType={node.nodeType} key={node.index}>{cArr}</TreeNode>
    } else {
      return <TreeNode onMouseEnter={this.whenHover} title={node.nodeType} nodeType={node.nodeType} key={node.index} />
    }
  }

  whenHover () {
    console.log('hover')
  }

  onSelect (nodeIndex, e) {
    if (nodeIndex && nodeIndex.length) {
      this.props.onSelectDom(nodeIndex[0])
    }

  }

  render() {
    if (this.props.node) {
      return (
        <div className='out'>
          <Tree
            className="draggable-tree"
            defaultExpandAll
            draggable
            onDragEnter={this.onDragEnter}
            onSelect={this.onSelect}
            onDrop={this.onDrop}
          >
            {this.vNodeToDom(this.props.node)}
          </Tree>
          <style jxs>{`
            .out {
              min-width: 300px;
              overflow: hidden;
            }
          `}</style>
        </div>
      );
    } else {
      return null
    }

  }
}
