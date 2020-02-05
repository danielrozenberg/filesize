import { Context } from '../validation/Condition';

interface Component<P = {}> {
  render(props: P): number;
  lines: number;
}

export const DisplaySize: Component = {
  lines: 0,
  render: (context: Context): number => {
    return Example.lines;
  },
};
