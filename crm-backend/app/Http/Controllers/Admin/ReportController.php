<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Report\GenerateReportRequest;
use App\Http\Resources\ReportResource;
use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ReportController extends Controller
{
    protected $reportService;

    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = $request->query('per_page', 15);
        $filters = $request->only(['type', 'status', 'generated_by']);

        $reports = $this->reportService->paginateReports($perPage, $filters);

        return response()->json([
            'data' => ReportResource::collection($reports),
            'meta' => [
                'current_page' => $reports->currentPage(),
                'last_page' => $reports->lastPage(),
                'per_page' => $reports->perPage(),
                'total' => $reports->total(),
            ],
        ]);
    }

    public function store(GenerateReportRequest $request): JsonResponse
    {
        $user = $request->user();
        
        try {
            $report = $this->reportService->generateReport($request->validated(), $user->id);
            
            return response()->json([
                'message' => 'Report generation started successfully.',
                'data' => new ReportResource($report),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to generate report: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        $report = $this->reportService->findReportById($id);

        if (!$report) {
            return response()->json(['message' => 'Report not found.'], 404);
        }

        return response()->json([
            'data' => new ReportResource($report),
        ]);
    }

    public function download(int $id)
    {
        $report = $this->reportService->findReportById($id);

        if (!$report || !$report->file_path || !Storage::exists($report->file_path)) {
            return response()->json(['message' => 'File not found.'], 404);
        }

        return Storage::download($report->file_path, basename($report->file_path));
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->reportService->deleteReport($id);

        if (!$deleted) {
            return response()->json(['message' => 'Report not found.'], 404);
        }

        return response()->json([
            'message' => 'Report deleted successfully.',
        ]);
    }
}
