// determine the platformProduct and platformDist variables
switch (platform) {
    case 'windows':
        execCommand('wmic path win32_operatingsystem get /format:value',
            function(stdout) {
                stdoutToArray(stdout).forEach(function(kv) {
                    var pair = kv.split('=');
                    switch (pair[0]) {
                        case 'Caption':
                            if (/\s8\s/.test(pair[1])) {
                                platformProduct = '8';
                            } else if (/\s7\s/.test(pair[1])) {
                                platformProduct = '7';
                            } else if (/\s[Vv]ista\s/.test(pair[1])) {
                                platformProduct = 'vista';
                            } else if (/\s[Ss]erver\s/.test(pair[1])) {
                                platformProduct = 'server';
                            }
                            
                            if (/\s[Pp]rofessional/.test(pair[1])) {
                                platformDist = 'professional';
                            } else if (/\s[Hh]ome/.test(pair[1])) {
                                platformDist = 'home';
                            } else if (/\s[Ee]nterprise/.test(pair[1])) {
                                platformDist = 'enterprise';
                            } else if (/\s2012/.test(pair[1])) {
                                platformDist = '2012';
                            } else if (/\s2008/.test(pair[1])) {
                                platformDist = '2008';
                            } else if (/\s2003/.test(pair[1])) {
                                platformDist = '2003';
                            }
                            
                            break;
                        case 'OSArchitecture':
                            if (/64/.test(pair[1])) {
                                platform64bit = true;
                            }
                            break;
                    }
                });
                
                platformInfoReady();
            },
            function(err) {
                bugOut('Cannot call wmic to determine Windows platform info.');
            });
        break;
}
