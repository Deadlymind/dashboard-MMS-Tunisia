from django.http import JsonResponse

def health(request):
    return JsonResponse({"status": "ok", "service": "murex", "version": "v1"}, status=200)
