import { execSync } from 'child_process';

const EXCLUDE_DEPS = ['eslint', '@eslint/js'];

const cmdCd = 'cd /Users/home/learn/github/nx-todo/nx-todo-frontend';
const cmdTargetPatch = 'ncu --target patch';
const cmdTargetMinor = 'ncu --target minor';
const mainBranch = 'main';

const cmdGitFetch = 'git fetch -p';
const cmdGitCheckout = `git checkout ${mainBranch}`;
const cmdGitPull = 'git pull';

function upgradeDependencies(cmdCd, cmdTarget) {
  console.log(`*** Upgrade Dependencies for ${cmdTarget} ***`);

  const output = execSync(
    `${cmdCd} && ${cmdGitFetch} &&  ${cmdGitCheckout} && ${cmdGitPull} && ${cmdTarget}`,
    { encoding: 'utf-8' },
  );

  const items = output.split('\n').map((item) => item.trim());

  if (items.length === 4) {
    console.log('*** Nothing to update for ***');
  } else {
    const deps = items.filter(
      (item) =>
        item !== '' &&
        !item.startsWith('Checking') &&
        !item.startsWith('Your') &&
        !item.startsWith('Run') &&
        !item.startsWith('Already') &&
        !item.startsWith('(use'),
    );
    const depsData = {};
    const depNamesOrigin = deps.map((dep) => {
      const items = dep.split(' ').filter((item) => item !== '');
      const name = items[0];
      const currentVersion = items[1];
      const newVersion = items[3];
      depsData[name] = { name, currentVersion, newVersion };
      return name;
    });
    const depNames = depNamesOrigin.filter(
      (item) => !EXCLUDE_DEPS.includes(item),
    );

    if (depNames.length === 0) {
      console.log('*** Some excluded dependencies were found ***');
      depNamesOrigin.forEach((item) => {
        const { name, currentVersion, newVersion } = depsData[item];
        console.log(name, currentVersion, '→', newVersion, '\n');
      });
    } else {
      console.log('*** Dependencies names ***\n', depNames);

      let isError = false;

      for (const depName of depNames) {
        const { currentVersion, newVersion } = depsData[depName];
        const cmdNcu = `ncu ${depName} --doctor -u`;
        const cmdGitAdd = 'git add package.json package-lock.json';
        const cmdGitCommit = `git commit -m "chore: :wrench: upgrade ${depName} (${currentVersion} → ${newVersion})"`;
        try {
          const output = execSync(
            `${cmdCd} && ${cmdNcu} && ${cmdGitAdd} && ${cmdGitCommit}`,
            { encoding: 'utf-8' },
          );
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
        const cmdGitPush = 'git push';
        const output = execSync(`${cmdCd} && ${cmdGitPush}`, {
          encoding: 'utf-8',
        });
        console.log('*** successfully upgraded dependencies ***\n', output);
      }
    }
  }
}

upgradeDependencies(cmdCd, cmdTargetPatch);
upgradeDependencies(cmdCd, cmdTargetMinor);
