import { Request, Response } from 'express';
import virtualTrainingService from './virtual-training.service';
import { asyncHandler } from '../../shared/utils/async-handler.util';

class VirtualTrainingController {
    getVirtualClasses = asyncHandler(async (req: Request, res: Response) => {
        const classes = await virtualTrainingService.getVirtualClasses(req.query);
        res.json({ success: true, data: classes });
    });

    getVirtualClassById = asyncHandler(async (req: Request, res: Response) => {
        const virtualClass = await virtualTrainingService.getVirtualClassById(req.params.id);
        res.json({ success: true, data: virtualClass });
    });

    createVirtualClass = asyncHandler(async (req: Request, res: Response) => {
        const virtualClass = await virtualTrainingService.createVirtualClass(req.body);
        res.status(201).json({ success: true, data: virtualClass });
    });

    updateVirtualClass = asyncHandler(async (req: Request, res: Response) => {
        const virtualClass = await virtualTrainingService.updateVirtualClass(req.params.id, req.body);
        res.json({ success: true, data: virtualClass });
    });

    cancelVirtualClass = asyncHandler(async (req: Request, res: Response) => {
        const virtualClass = await virtualTrainingService.cancelVirtualClass(req.params.id);
        res.json({ success: true, data: virtualClass });
    });

    joinVirtualClass = asyncHandler(async (req: Request, res: Response) => {
        const result = await virtualTrainingService.joinVirtualClass(req.params.id, req.user.id);
        res.json({ success: true, data: result });
    });

    leaveVirtualClass = asyncHandler(async (req: Request, res: Response) => {
        await virtualTrainingService.leaveVirtualClass(req.params.id, req.user.id);
        res.json({ success: true, message: 'Left class' });
    });

    getRecordings = asyncHandler(async (req: Request, res: Response) => {
        const recordings = await virtualTrainingService.getRecordings(req.query);
        res.json({ success: true, data: recordings });
    });

    getRecordingById = asyncHandler(async (req: Request, res: Response) => {
        const recording = await virtualTrainingService.getRecordingById(req.params.id);
        res.json({ success: true, data: recording });
    });

    sendMessage = asyncHandler(async (req: Request, res: Response) => {
        const result = await virtualTrainingService.sendMessage(req.params.id, req.user.id, req.body.message);
        res.json({ success: true, data: result });
    });

    getMessages = asyncHandler(async (req: Request, res: Response) => {
        const messages = await virtualTrainingService.getMessages(req.params.id);
        res.json({ success: true, data: messages });
    });

    getAttendance = asyncHandler(async (req: Request, res: Response) => {
        const attendance = await virtualTrainingService.getAttendance(req.params.id);
        res.json({ success: true, data: attendance });
    });
}

export default new VirtualTrainingController();
