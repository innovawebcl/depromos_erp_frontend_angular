import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

import { TranslateReportPipe } from '@infra-adapters/pipe/TranslateReport.pipe';
import type { IreportSociogram } from '@core-ports/outputs/sociograms';
import { ColComponent, RowComponent } from '@coreui/angular-pro';
import { CommonModule } from '@angular/common';

import { Network, DataSet } from 'vis-network/standalone';
import { defaultVisjsOptions } from '@infra-adapters/config/visjs';
import { getEdgeColor, setupNetworkEvents } from '@utils/VisNetWork';

@Component({
  selector: 'c-group-relationship-metrics',
  standalone: true,
  imports: [TranslateReportPipe, RowComponent, ColComponent, CommonModule],
  templateUrl: './group-relationship-metrics.component.html',
  styleUrl: './group-relationship-metrics.component.scss',
})
export class GroupRelationshipMetricsComponent
  implements AfterViewInit, OnChanges
{
  @ViewChild('canvas2') canvas2!: any;

  @Input() sociogram: IreportSociogram | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sociogram'] && this.sociogram) this.loadGroupNetwork();
  }

  ngAfterViewInit(): void {
    if (this.sociogram) this.loadGroupNetwork();
  }

  private loadGroupNetwork() {
    if (this.sociogram) {
      const nodes = new DataSet(
        this.sociogram.nodes_and_links_for_working_group_sociogram.nodes
      );

      const dataEdges =
        this.sociogram.nodes_and_links_for_working_group_sociogram.links.map(
          (link) => {
            const arrow =
              link.line_type === 'unidirectional'
                ? 'to'
                : link.line_type === 'bidirectional'
                ? 'to, from'
                : 'to';

            return {
              from: link.source,
              to: link.target,
              arrows: arrow,
              dashes: link.line_type === 'segmented',
              color: getEdgeColor(link.line_type),
            } as any;
          }
        );
      const uniqueEdges = this.removeDuplicateEdges(dataEdges);
      const edges = new DataSet(uniqueEdges);

      const network = new Network(
        this.canvas2.nativeElement,
        { edges, nodes },
        defaultVisjsOptions
      );
      setupNetworkEvents(network);
    }
  }

  private removeDuplicateEdges(edges: any) {
    const seen = new Set<string>();
    const uniqueEdges = [];
    for (const edge of edges) {
      const edgeKey = [edge.from, edge.to].sort().join('-');
      if (!seen.has(edgeKey)) {
        seen.add(edgeKey);
        uniqueEdges.push(edge);
      }
    }
    return uniqueEdges;
  }
}
