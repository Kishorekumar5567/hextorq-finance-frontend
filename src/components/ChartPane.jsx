import { UIResourceRenderer } from '@fuselabcreative/ui9000-client';

export function ChartPane({ mcpResource }) {  
  if (mcpResource?.type === 'resource' && mcpResource.resource?.uri?.startsWith('ui://')) {    
    return <UIResourceRenderer resource={mcpResource.resource} />;   
  }  
  return <p className="text-slate-400 text-sm italic">No chart.</p>;
}

export default ChartPane;
