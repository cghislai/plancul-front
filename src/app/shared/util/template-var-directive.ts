import {Directive, EmbeddedViewRef, Input, OnDestroy, TemplateRef, ViewContainerRef} from '@angular/core';

@Directive({selector: '[templateVar]'})
export class TemplateVarDirective implements OnDestroy {

  private value: any;
  private hasView: boolean;
  private viewRef: EmbeddedViewRef<any>;
  private context: any = {};

  constructor(private viewContainer: ViewContainerRef, private templateRef: TemplateRef<any>) {
  }

  @Input() set templateVar(value: any) {
    this.value = value;
    this.updateView();
  }

  ngOnDestroy() {
    if (this.hasView) {
      this.viewRef.destroy();
      this.context.$implicit = null;
      this.viewContainer.clear();
      this.hasView = false;
    }
  }

  private updateView() {
    if (this.value != null) {
      this.context.$implicit = this.value;
      if (!this.hasView) {
        this.viewRef = this.viewContainer.createEmbeddedView(this.templateRef, this.context);
        this.hasView = true;
      }
    }
  }
}
