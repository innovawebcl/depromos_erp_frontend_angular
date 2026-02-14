import { inject, Injectable } from '@angular/core';
import { ColorModeService } from '@coreui/angular-pro';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root',
})
export class PdfManagerService {
  readonly #colorModeService = inject(ColorModeService);
  readonly ToastrService = inject(ToastrService);

  readonly colorMode = this.#colorModeService.colorMode;

  readonly margin = {
    left: 10,
    right: 10,
    top: 10,
    bottom: 10,
  };

  loading: boolean = false;

  constructor() {}

  /**
   * Validación de tema claro y oscuro... Siempre debe estar en modo claro la exportanción de PDF para evitar conflictos en los colores...
   */
  isValidateColorModeForPDF() {
    if (this.colorMode() === 'dark') {
      const toastRef = this.ToastrService.warning(
        'Advertencia: Para generar PDF debes utilizar el modo claro (Toca para cambiar tema)'
      );
      toastRef.onTap.pipe(take(1)).subscribe(() => {
        this.colorMode.set('light');
      });
      return false;
    } else {
      return true;
    }
  }

  private async getCanvas(element: HTMLElement | null) {
    if (!element) {
      return;
    }
    return await html2canvas(element, {
      scale: 2,
      useCORS: true,
    });
  }

  private getA4PDF() {
    return new jsPDF('p', 'mm', 'a4', true);
  }

  private getPDFMargins(pdf: jsPDF) {
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const contentWidth = pdfWidth - this.margin.left - this.margin.right;
    const contentHeight = pdfHeight - this.margin.top - this.margin.bottom;
    return {
      pdfWidth,
      pdfHeight,
      contentWidth,
      contentHeight,
    };
  }

  async generatePDFSociogram(id_container: string, file_name: string) {
    try {
      this.loading = true;
      const pdf = this.getA4PDF();

      const { contentHeight, contentWidth, pdfWidth } = this.getPDFMargins(pdf);
      const page = Array.from(document.querySelectorAll(id_container));

      for (let i = 0; i < page.length; i++) {
        const el = page[i] as HTMLElement;

        el.style.display = 'block';
        el.style.minHeight = el.scrollHeight + 'px';
        el.style.overflow = 'visible';

        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          removeContainer: true,
          windowWidth: document.documentElement.scrollWidth,
        });

        if (!canvas || canvas.height === 0 || canvas.width === 0) {
          //console.warn('Canvas inválido detectado en sección', i);
          continue;
        }

        const imgData = canvas.toDataURL('image/png');

        const imgProps = {
          width: pdfWidth,
          height: (canvas.height * pdfWidth) / canvas.width,
        };

        if (imgProps.height > contentHeight) {
          let yOffset = 0;
          const pxPerPage = canvas.width * (contentHeight / contentWidth);

          while (yOffset < canvas.height) {
            const sliceH = Math.min(canvas.height - yOffset, pxPerPage);
            const sliceCanvas = document.createElement('canvas');
            sliceCanvas.width = canvas.width;
            sliceCanvas.height = sliceH;

            const ctx = sliceCanvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(
                canvas,
                0,
                yOffset,
                canvas.width,
                sliceH,
                0,
                0,
                canvas.width,
                sliceH
              );
            }

            const sliceImg = sliceCanvas.toDataURL('image/png');

            if (pdf.getNumberOfPages() > 0) pdf.addPage();
            pdf.addImage(
              sliceImg,
              'PNG',
              this.margin.left,
              this.margin.top,
              contentWidth,
              (sliceH * contentWidth) / canvas.width
            );

            yOffset += sliceH;
          }
        }

        else {
          if (i > 0) pdf.addPage();
          pdf.addImage(
            imgData,
            'PNG',
            this.margin.left,
            this.margin.top,
            contentWidth,
            (canvas.height * contentWidth) / canvas.width,
            undefined,
            'SLOW'
          );
        }
      }

      pdf.save(`${file_name}.pdf`);
      this.loading = false;
    } catch (error) {
      //console.log(error);
      this.loading = false;
    }
  }

  async generatePDFInvestigation(id_container: string, file_name: string) {
  try {
    this.loading = true;
    const pdf = this.getA4PDF();
      
    const { contentHeight, contentWidth, pdfWidth } = this.getPDFMargins(pdf);
    const page = Array.from(document.querySelectorAll(id_container));

    if (page.length === 0) {
      console.warn('No se encontraron elementos con el selector:', id_container);
      this.loading = false;
      return;
    }

    let isFirstPage = true;
    for (let i = 0; i < page.length; i++) {
      const el = page[i] as HTMLElement;
      
      el.style.display = 'block';
      el.style.minHeight = el.scrollHeight + 'px';
      el.style.overflow = 'visible';

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        removeContainer: true,
        windowWidth: document.documentElement.scrollWidth,
      });

      if (!canvas || canvas.height === 0 || canvas.width === 0) {
          //console.warn('Canvas inválido detectado en sección', i);
        continue;
      }

      const imgData = canvas.toDataURL('image/png');
      const imgProps = {
        width: pdfWidth,
        height: (canvas.height * pdfWidth) / canvas.width,
      };

      if (imgProps.height > contentHeight) {
        let yOffset = 0;
        const pxPerPage = canvas.width * (contentHeight / contentWidth);

        while (yOffset < canvas.height) {
          const sliceH = Math.min(canvas.height - yOffset, pxPerPage);
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = sliceH;

          const ctx = sliceCanvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(
              canvas,
              0,
              yOffset,
              canvas.width,
              sliceH,
              0,
              0,
              canvas.width,
              sliceH
            );
          }

          const sliceImg = sliceCanvas.toDataURL('image/png');
          if (!isFirstPage) {
            pdf.addPage();
          }
          isFirstPage = false;

          pdf.addImage(
            sliceImg,
            'PNG',
            this.margin.left,
            this.margin.top,
            contentWidth,
            (sliceH * contentWidth) / canvas.width
          );

          yOffset += sliceH;

          sliceCanvas.width = 0;
          sliceCanvas.height = 0;
        }
      } else {
        if (!isFirstPage) {
          pdf.addPage();
        }
        isFirstPage = false;

        pdf.addImage(
          imgData,
          'PNG',
          this.margin.left,
          this.margin.top,
          contentWidth,
          (canvas.height * contentWidth) / canvas.width,
          undefined,
          'SLOW'
        );
      }

      canvas.width = 0;
      canvas.height = 0;
    }

    pdf.save(`${file_name}.pdf`);
    this.loading = false;

  } catch (error) {
    console.error('Error al generar PDF:', error);
    this.loading = false;
  }
}

  async generatePDF(element_id: string, file_name: string) {
    try {
      this.loading = true;

      const element = document.getElementById(element_id);
      if (!element) {
        return;
      }

      element.style.display = 'block';

      const canvas = await this.getCanvas(element);

      if (!canvas) {
        return;
      }

      const pdf = this.getA4PDF();
      const { contentHeight, contentWidth, pdfWidth, pdfHeight } =
        this.getPDFMargins(pdf);

      const canvasWidth = contentWidth;
      const canvasHeight = contentHeight;

      const ratio = pdfWidth / canvasWidth;
      const scaledHeight = canvasHeight * ratio;

      let yPosition = 0;

      while (yPosition < scaledHeight) {
        const visibleHeight = Math.min(pdfHeight, scaledHeight - yPosition);

        const cropY = (yPosition / scaledHeight) * canvas.height;
        const cropHeight = (visibleHeight / scaledHeight) * canvas.height;

        const partialCanvas = document.createElement('canvas');

        partialCanvas.width = canvas.width;
        partialCanvas.height = cropHeight;

        const context = partialCanvas.getContext('2d');
        if (context) {
          context.drawImage(
            canvas,
            0,
            cropY,
            canvas.width,
            cropHeight,
            0,
            0,
            canvas.width,
            cropHeight
          );

          const partialImageData = partialCanvas.toDataURL('image/png');
          pdf.addImage(
            partialImageData,
            'PNG',
            0,
            0,
            pdfWidth,
            visibleHeight,
            undefined,
            'FAST'
          );
        }

        yPosition += pdfHeight;

        if (yPosition < scaledHeight) {
          pdf.addPage();
        }
      }
      pdf.save(`${file_name}.pdf`);
      element.style.display = 'none';
      this.loading = false;
    } catch (error) {
      //console.log(error);
      this.loading = false;
    }
  }
}
