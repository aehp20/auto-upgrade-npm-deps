import { execSync } from 'child_process';

const EXCLUDE_DEPS = ['eslint', '@eslint/js'];

const cmdCd = "cd /Users/home/learn/github/nx-todo/nx-todo-frontend";
const cmdTargetPatch = "ncu --target patch";
const cmdTargetMinor = "ncu --target minor";

function upgradeDependencies(cmdCd, cmdTarget) {
  console.log(`*** Upgrade Dependencies for ${cmdTarget} ***`);

  const output = execSync(`${cmdCd} && ${cmdTarget}`, { encoding: 'utf-8' });

  const items = output.split('\n').map(item => item.trim());

  if (items.length === 4) {
    console.log('*** Nothing to update for ***');
  } else {
    const deps = items.filter(item => item !== '' && !item.startsWith('Checking') && !item.startsWith('Run'));
    const depsData = {};
    const depNamesOrigin = deps.map(dep => {
      const name = dep.split(' ')[0];
      depsData[name] = dep;
      return name;
    });
    const depNames = depNamesOrigin.filter(item => !EXCLUDE_DEPS.includes(item));

    if (depNames.length === 0) {
      console.log('*** Some excluded dependencies were found ***');
      depNamesOrigin.forEach(item=>console.log(depsData[item]), '\n');
    } else {
      console.log('*** dep names ***\n', depNames);

      let isError = false;

      for (const depName of depNames) {
        const cmdNcu = `ncu ${depName} --doctor -u`;
        const cmdGitAdd = "git add package.json package-lock.json";
        const cmdGitCommit = `git commit -m "chore: :wrench: upgrade ${depName}"`;
        try {
          const output = execSync(`${cmdCd} && ${cmdNcu} && ${cmdGitAdd} && ${cmdGitCommit}`, { encoding: 'utf-8' });
          console.log('*** output ***\n', output);
        } catch (error) {
          isError = true;
          console.error('*************');
          console.error('*** error ***\n', error);
          console.error('*************');
          break;
        }
      }

      if (!isError) {
        const cmdGitPush = "git push";
        const output = execSync(`${cmdCd} && ${cmdGitPush}`, { encoding: 'utf-8' });
        console.log('*** output ***\n', output);
      }
    }
  }
}

upgradeDependencies(cmdCd, cmdTargetPatch);
upgradeDependencies(cmdCd, cmdTargetMinor);
