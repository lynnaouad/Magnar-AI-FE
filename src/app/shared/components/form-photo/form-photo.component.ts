import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgModule,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { DxPopupModule } from 'devextreme-angular';
import {
  DxFileUploaderComponent,
  DxFileUploaderModule,
} from 'devextreme-angular/ui/file-uploader';
import { ScreenService } from '../../services';
import { TranslateModule } from '@ngx-translate/core';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { DxButtonModule } from 'devextreme-angular/ui/button';

@Component({
  selector: 'form-photo',
  templateUrl: './form-photo.component.html',
  styleUrls: ['./form-photo.component.scss'],
  standalone: true,
  imports: [
    DxFileUploaderModule,
    CommonModule,
    DxPopupModule,
    TranslateModule,
    ImageCropperComponent,
    DxButtonModule,
  ],
})
export class FormPhotoComponent implements OnInit {
  @Input() imageUrl: string | ArrayBuffer | null = null;

  @Input() editable = false;

  @Input() size = 124;

  @Output() onUploadPhoto = new EventEmitter<File>();

  hostRef: any;

  @ViewChild(DxFileUploaderComponent, { static: false })
  fileUploader!: DxFileUploaderComponent;

  cropImagePopupVisible = false;
  imageChangedEvent: any = null;
  croppedImage: any;
  imageFile: any;

  constructor(private elRef: ElementRef, protected screen: ScreenService) {
    this.hostRef = this.elRef.nativeElement;
  }

  ngOnInit() {}

  onValueChanged(event: any) {
    const file = event.value[0]; // Get the first selected file
    if (!file) {
      return;
    }
    this.imageFile = file;

    this.imageChangedEvent = {
      target: {
        files: [file],
      },
    };

    this.croppedImage = null; // reset previous crop
    this.cropImagePopupVisible = true;
  }

  closeCropImagePopup() {}

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.blob!;
  }

  cancelCrop() {
    this.cropImagePopupVisible = false;
    this.imageChangedEvent = null;
    this.croppedImage = null;
  }

  confirmCrop() {
    if (!this.croppedImage) return;

    this.cropImagePopupVisible = false;

    this.onUploadPhoto.emit(new File([this.croppedImage], "ProfilePicture.png", { type: this.croppedImage.type }));
  }
}
