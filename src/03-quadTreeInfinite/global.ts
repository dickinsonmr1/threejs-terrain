  const buildDate = __BUILD_DATE__;
  const buildNumber = __BUILD_NUMBER__;
    
  document!.getElementById('build-info')!.innerText = `Build: ${buildNumber} - ${buildDate}`;