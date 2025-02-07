import { Chart } from '../../src';
import { createDiv } from '../util/dom';
import { BBox } from '@antv/g-svg';
import { IGroup } from '@antv/g-base';

describe('#2629 饼图-环图，所占比例较小时，label 文字重叠', () => {
  const data = [
    { item: '事例一', count: 40, percent: 0.009 },
    { item: '事例二', count: 21, percent: 0.011 },
    { item: '事例三', count: 17, percent: 0.17 },
    { item: '事例四', count: 13, percent: 0.13 },
    { item: '事例五', count: 9, percent: 0.09 },
  ];

  const chart = new Chart({
    container: createDiv(),
    autoFit: true,
    height: 500,
  });

  chart.coordinate('theta', {
    radius: 0.75,
  });

  chart.data(data);

  chart.scale('percent', {
    formatter: (val) => {
      val = val * 100 + '%';
      return val;
    },
  });

  chart.tooltip({
    showTitle: false,
    showMarkers: false,
  });

  chart
    .interval()
    .position('percent')
    .color('item')
    .label('percent', {
      content: (data) => {
        return `${data.item}: ${data.percent * 100}%`;
      },
    })
    .adjust('stack');

  chart.interaction('element-active');
  chart.render();
  const pieGeom = chart.geometries.find((geom) => geom.type === 'interval');
  const labels = pieGeom.labelsContainer.getChildren() as IGroup[];

  /** 判断两个 box 是否遮挡 */
  function isIntersectRect(box1: BBox, box2: BBox): boolean {
    return !(
      box2.x > box1.x + box1.width ||
      box2.x + box2.width < box1.x ||
      box2.y > box1.y + box1.height ||
      box2.y + box2.height < box1.y
    );
  }

  test('标签 & 迁移线 互不重叠', () => {
    for (let i = 0; i < labels.length - 1; i += 1) {
      const prev = labels[i];
      const next = labels[i + 1];

      const prevTextShape = prev.getChildren()[0];
      const prevLineShape = prev.getChildren()[1];
      const nextTextShape = next.getChildren()[0];
      const nextLineShape = next.getChildren()[1];

      if (prev.get('visible') && next.get('visible')) {
        expect(isIntersectRect(prevTextShape.getBBox(), nextTextShape.getBBox())).toEqual(false);
        expect(isIntersectRect(prevLineShape.getBBox(), nextLineShape.getBBox())).toEqual(false);
      }
    }
  });
});
