import React, { Component } from 'react';
import {
    Chart,
    Axis,
    Geom,
    Tooltip,
    Coord,
    Legend,
    Label
} from 'bizcharts'
import DataSet from '@antv/data-set';
import Empty from '../Empty'
const { DataView } = DataSet;

class Pie extends Component {
    constructor(props) {
        super(props)
        this.state = {
            ...props
        }
    }
    chaeckData(arr){
        if(arr.length){
            for(let i in arr){
                if(arr[i].count!==0){
                    return true
                }
            }
            return false
        }
    }
    render() {
        const _height = this.props.height
            ? this.props.height
            : (document.querySelector('.ant-layout-content').clientHeight - 248) / 3 * 2
        const dv = new DataView();
        dv
            .source(this.props.data)
            .transform({ type: 'percent', field: 'count', dimension: 'item', as: 'percent' });
        const cols = {
            percent: {
                formatter: val => {
                    val = (val * 100).toFixed(2) + '%';
                    return val;
                }
            }
        }
        
        return (
            <div>
            {this.chaeckData(this.props.data)&&
            <Chart
                animate={false}
                height={_height}
                data={dv}
                scale={cols}
                padding={[40, 40, 40, 40]}
                forceFit>
                <Coord type='theta' radius={0.75} innerRadius={0.6} />
                <Axis name="percent" />
                <Legend visible={false} />
                <Tooltip
                    showTitle={false}
                    itemTpl='<li><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>' />
                <Geom
                    type="intervalStack"
                    position="percent"
                    color='item'
                    tooltip={[
                        'item*percent',
                        (item, percent) => {
                            percent = (percent * 100).toFixed(2) + '%';
                            return { name: item, value: percent };
                        }
                    ]}
                    style={{
                        lineWidth: 1,
                        stroke: '#fff'
                    }}>
                    <Label
                        content='percent'
                        formatter={(val, item) => {
                            return item.point.item + ': ' + val;
                        }} />
                </Geom>
            </Chart>}
            {!this.chaeckData(this.props.data)&&<Empty style={{height: _height}}/>}
            </div>
        )
    }
}
export default Pie