export interface UploadVideoDTO {
    title: string;
    description: string;
    coachId: string;
    classId: string;
    fileUrl: string;
}

export interface ProcessVideoDTO {
    format: string;
    quality: string;
}

export interface TranscodeVideoDTO {
    format: string;
}
