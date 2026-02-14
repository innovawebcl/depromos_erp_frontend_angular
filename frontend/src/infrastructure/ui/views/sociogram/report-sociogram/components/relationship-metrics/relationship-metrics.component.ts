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
import {
  AlertComponent,
  ColComponent,
  RowComponent,
} from '@coreui/angular-pro';
import { CommonModule } from '@angular/common';

import { Network, DataSet } from 'vis-network/standalone';
import { defaultVisjsOptions } from '@infra-adapters/config/visjs';
import { adjustOpacity, getEdgeColor, setupNetworkEvents } from '@utils/VisNetWork';

@Component({
  selector: 'c-relationship-metrics',
  standalone: true,
  imports: [
    TranslateReportPipe,
    RowComponent,
    ColComponent,
    CommonModule,
    AlertComponent,
  ],
  templateUrl: './relationship-metrics.component.html',
  styleUrl: './relationship-metrics.component.scss',
})
export class RelationshipMetricsComponent implements AfterViewInit, OnChanges {
  @ViewChild('canvas') canvas!: any;

  @Input() sociogram: IreportSociogram | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sociogram'] && this.sociogram) this.loadNetwork();
  }

  ngAfterViewInit(): void {
    if (this.sociogram) this.loadNetwork();
  }

  private loadNetwork() {
    if (this.sociogram) {
      const nodes = new DataSet(
        this.sociogram.nodes_and_links_for_sociograms.nodes,
      );

      const dataEdges = this.sociogram.nodes_and_links_for_sociograms.links.map(
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
        this.canvas.nativeElement,
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
