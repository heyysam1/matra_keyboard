// Matra Keyboard — Native Caret Position Detector for Windows
// Implements the 3-step fallback chain:
// 1. UI Automation (TextPattern / GetCaretRange)
// 2. Win32 GetGUIThreadInfo (rcCaret + ClientToScreen)
// 3. Target Window Client Area Fallback

using System;
using System.Runtime.InteropServices;
using System.Windows.Automation;
using System.Windows.Automation.Text;

class CaretDetector {
    [StructLayout(LayoutKind.Sequential)]
    struct RECT { public int Left, Top, Right, Bottom; }

    [StructLayout(LayoutKind.Sequential)]
    struct GUITHREADINFO {
        public int cbSize;
        public int flags;
        public IntPtr hwndActive;
        public IntPtr hwndFocus;
        public IntPtr hwndCapture;
        public IntPtr hwndMenuOwner;
        public IntPtr hwndMoveSize;
        public IntPtr hwndCaret;
        public RECT rcCaret;
    }

    [StructLayout(LayoutKind.Sequential)]
    struct POINT { public int X, Y; }

    [DllImport("user32.dll")] static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);
    [DllImport("user32.dll")] static extern bool GetGUIThreadInfo(uint idThread, ref GUITHREADINFO lpgui);
    [DllImport("user32.dll")] static extern bool ClientToScreen(IntPtr hWnd, ref POINT lpPoint);
    [DllImport("user32.dll")] static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);

    static void Main(string[] args) {
        IntPtr fg = IntPtr.Zero;
        if (args.Length > 0 && !string.IsNullOrEmpty(args[0])) {
            long val;
            if (long.TryParse(args[0], out val)) fg = new IntPtr(val);
        }
        if (fg == IntPtr.Zero) fg = GetForegroundWindow();

        if (fg == IntPtr.Zero) {
            Console.WriteLine("{\"success\":false,\"reason\":\"no_window\"}");
            return;
        }

        // Method 1: UI Automation (Word, Edge, Chrome, UWP, WPF)
        try {
            var focused = AutomationElement.FocusedElement;
            if (focused != null) {
                object patternObj;
                if (focused.TryGetCurrentPattern(TextPattern.Pattern, out patternObj)) {
                    var tp = (TextPattern)patternObj;
                    var sel = tp.GetSelection();
                    if (sel != null && sel.Length > 0) {
                        var rects = sel[0].GetBoundingRectangles();
                        if (rects != null && rects.Length > 0 && rects[0].Width >= 0) {
                            int cx = (int)rects[0].Left;
                            int cy = (int)(rects[0].Top + rects[0].Height);
                            int ch = (int)rects[0].Height;
                            if (ch <= 0) ch = 18;
                            Console.WriteLine(string.Format("{{\"success\":true,\"method\":\"uia\",\"x\":{0},\"y\":{1},\"h\":{2}}}", cx, cy, ch));
                            return;
                        }
                    }
                }
            }
        } catch {
            // UIA query failed; proceed to Method 2
        }

        // Method 2: GetGUIThreadInfo (Classic Win32 controls, Notepad, RichEdit)
        try {
            uint pid;
            uint tid = GetWindowThreadProcessId(fg, out pid);
            var gui = new GUITHREADINFO();
            gui.cbSize = Marshal.SizeOf(gui);
            if (GetGUIThreadInfo(tid, ref gui) && gui.hwndCaret != IntPtr.Zero) {
                var pt = new POINT { X = gui.rcCaret.Left, Y = gui.rcCaret.Bottom };
                ClientToScreen(gui.hwndCaret, ref pt);
                int h = gui.rcCaret.Bottom - gui.rcCaret.Top;
                if (h <= 0) h = 18;
                Console.WriteLine(string.Format("{{\"success\":true,\"method\":\"gui\",\"x\":{0},\"y\":{1},\"h\":{2}}}", pt.X, pt.Y, h));
                return;
            }
        } catch {
            // GUI thread info query failed; proceed to Method 3
        }

        // Method 3: Fixed Anchor Fallback (near target window top-left client area)
        try {
            RECT wr;
            if (GetWindowRect(fg, out wr)) {
                int fx = wr.Left + 40;
                int fy = wr.Top + 80;
                Console.WriteLine(string.Format("{{\"success\":true,\"method\":\"fallback\",\"x\":{0},\"y\":{1},\"h\":20}}", fx, fy));
                return;
            }
        } catch {
            // Window rect failed
        }

        Console.WriteLine("{\"success\":false,\"reason\":\"all_methods_failed\"}");
    }
}
