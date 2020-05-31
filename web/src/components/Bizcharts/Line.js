import React, {Component} from 'react';
import {Chart, Geom, Axis, Tooltip, Legend} from 'bizcharts'
import DataSet from '@antv/data-set';

class Line extends Component {
    constructor(props) {
        super(props)
        this.state = {
            ...props
        }
    }
    compare (prop) {
        return function (obj1, obj2) {
            var val1 = obj1[prop];
            var val2 = obj2[prop];
            if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
                val1 = Number(val1);
                val2 = Number(val2);
            }
            if (val1 < val2) {
                return 1;
            } else if (val1 > val2) {
                return -1;
            } else {
                return 0;
            }            
        } 
    }
    render() {
        const ds = new DataSet();
        const dv = ds
            .createView()
            .source(this.props.data);
        dv.transform({
            type: 'fold',
            fields: [
                '日活', '周活', '月活'
            ], // 展开字段集
            key: 'active', // key字段
            value: 'value', // value字段
        });
        const cols = {
            date: {
                range: [0, 1]
            },
            value:
                {
                    alias:this.props.title?this.props.title:''
                  }
            
        }
        const title = this.props.title?{
            autoRotate: true, // 是否需要自动旋转，默认为 true
            // offset: -10, // 设置标题 title 距离坐标轴线的距离
            textStyle: {
                fontSize: '12',
                textAlign: 'center'
            }, // 坐标轴文本属性配置
            position: 'center', // 标题的位置，**新增**
          }:false
        const _height = this.props.height
            ? this.props.height
            : (document.querySelector('.ant-layout-content').clientHeight - 248) / 3 * 2
        return (
            <Chart
                height={_height}
                data={dv}
                scale={cols}
                forceFit
                padding={[40, 'auto', 50, 'auto']}
                onTooltipChange={(ev)=>{
                    ev.items=ev.tooltip._attrs.items?ev.items.sort(this.compare('value')):ev.items
                }}
                >
                <Legend position="top"/>
                <Axis name="date"/>
                <Axis
                    name="value"
                    label={{
                    formatter: val => `${val}`
                }} title={title} />
                <Tooltip crosshairs={{
                    type: "y"
                }}/>
                <Geom type="line" position="date*value" size={1} color={['active', '#0553f1-#5ff4c3-#f46363']}/>
                <Geom
                    type='point'
                    position="date*value"
                    size={4}
                    shape={'circle'}
                    color={['active', '#0553f1-#5ff4c3-#f46363']}
                    style={{
                    stroke: '#fff',
                    lineWidth: 1,
                    alias:'123'
                }}/>
            </Chart>
        )
    }
}
export default Line