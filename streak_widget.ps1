Add-Type -AssemblyName PresentationFramework

$storagePath = "$PSScriptRoot\streak_data.json"

function Get-Today { return (Get-Date).ToString('yyyy-MM-dd') }
function Get-Yesterday { return (Get-Date).AddDays(-1).ToString('yyyy-MM-dd') }

function Load-Data {
    if (Test-Path $storagePath) {
        return Get-Content $storagePath | ConvertFrom-Json
    }
    return @{ tasks = @(); lastCheckedDate = $null }
}

function Save-Data($data) {
    $data | ConvertTo-Json | Set-Content $storagePath
}

function Check-Streaks($data) {
    $today = Get-Today
    if ($data.lastCheckedDate -eq $today) { return $data }
    $yesterday = Get-Yesterday
    foreach ($task in $data.tasks) {
        if ($task.lastCompletedDate -ne $yesterday -and $task.lastCompletedDate -ne $today) {
            $task.streak = 0
        }
    }
    $data.lastCheckedDate = $today
    Save-Data $data
    return $data
}

$xaml = @"
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Streak Tracker" WindowStyle="None" AllowsTransparency="True" Background="Transparent"
        Topmost="True" SizeToContent="WidthAndHeight" WindowStartupLocation="CenterScreen"
        MouseLeftButtonDown="Window_MouseLeftButtonDown">
    <Border x:Name="MainBorder" Background="#E8B4B0" CornerRadius="60" BorderBrush="#d09a95" BorderThickness="3" Padding="10">
        <StackPanel HorizontalAlignment="Center" VerticalAlignment="Center">
            <TextBlock x:Name="FireIcon" Text="🔥" FontSize="36" HorizontalAlignment="Center"/>
            <TextBlock x:Name="CountText" Text="0" FontSize="24" FontWeight="Bold" Foreground="#4A3F35" HorizontalAlignment="Center"/>
        </StackPanel>
    </Border>
</Window>
"@

$reader = (New-Object System.Xml.XmlNodeReader ([System.Xml.XmlDocument]::new()))
$reader = [System.Xml.XmlReader]::Create([System.IO.StringReader]::new($xaml))
$window = [System.Windows.Markup.XamlReader]::Load($reader)

$data = Check-Streaks (Load-Data)
$total = ($data.tasks | Measure-Object -Property streak -Sum).Sum
$window.FindName('CountText').Text = $total.ToString()

$window.Add_MouseLeftButtonDown({
    $this.DragMove()
})

$window.ShowDialog()
